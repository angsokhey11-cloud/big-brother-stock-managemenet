-- BIG BROTHER Cloud Back Sale explicit source selection.
-- Review before deployment: source pulled from live Cloud function 01-Nov-2026.
-- Existing transactions unchanged; source-aware payload supported; legacy fallback retained.
CREATE OR REPLACE FUNCTION public.bb_stock_save_batch_reference_internal(p_payload jsonb, p_type text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare


  v_request_id text :=
    nullif(
      trim(
        coalesce(
          p_payload->>'requestId',
          ''
        )
      ),
      ''
    );


  v_existing
    public.stock_movement_requests%rowtype;


  v_activity_date date :=
    coalesce(
      nullif(
        p_payload->>'activityDate',
        ''
      )::date,
      current_date
    );


  v_batch_id text :=
    trim(
      coalesce(
        p_payload->>'batchId',
        ''
      )
    );


  v_batch
    public.stock_batches%rowtype;


  v_batch_item
    public.stock_batch_items%rowtype;


  v_warehouse_code text :=
    coalesce(

      nullif(
        trim(
          coalesce(
            p_payload->>'warehouseLocationCode',
            ''
          )
        ),
        ''
      ),

      public.bb_stock_default_warehouse_internal()

    );


  v_warehouse_name text;


  v_controller_id text :=
    nullif(
      trim(
        coalesce(
          p_payload->>'inventoryControllerStaffId',
          ''
        )
      ),
      ''
    );


  v_controller_name text;


  v_reference_no text :=
    nullif(
      trim(
        coalesce(
          p_payload->>'referenceNo',
          ''
        )
      ),
      ''
    );


  v_note text :=
    nullif(
      trim(
        coalesce(
          p_payload->>'note',
          ''
        )
      ),
      ''
    );


  v_items jsonb :=
    coalesce(
      p_payload->'items',
      '[]'::jsonb
    );


  v_item jsonb;


  v_product
    public.products%rowtype;


  v_qty numeric;


  v_purchased_back numeric;
  v_zero_back numeric;


  v_purchase_cost numeric;


  v_movement_id text;
  v_transaction_id text;


  v_revision text;


  v_lines jsonb :=
    '[]'::jsonb;


  v_deltas jsonb :=
    '[]'::jsonb;


  v_response jsonb;


  v_seen text[] :=
    array[]::text[];


  v_total numeric :=
    0;


begin


  perform pg_advisory_xact_lock(
    hashtext(
      'BB_STOCK_WRITE'
    )
  );


  p_type :=
    upper(
      trim(
        p_type
      )
    );


  if p_type not in (
    'BACK_SALE',
    'STOCK_DAMAGE'
  )
  then

    raise exception
      'Invalid Batch reference movement';

  end if;



  if v_request_id is null then

    v_request_id :=

      'STKREQ-'

      ||

      to_char(
        clock_timestamp()
        at time zone
        'Asia/Phnom_Penh',
        'YYYYMMDDHH24MISSMS'
      )

      ||

      '-'

      ||

      substr(
        md5(
          random()::text
        ),
        1,
        6
      );

  end if;



  select *

  into v_existing

  from public.stock_movement_requests

  where request_id =
        v_request_id;


  if found then

    return

      v_existing.response_payload

      ||

      jsonb_build_object(
        'duplicate',
        true,
        'requestId',
        v_request_id
      );

  end if;



  if v_batch_id = '' then

    raise exception
      'Open Batch is required';

  end if;



  select *

  into v_batch

  from public.stock_batches

  where batch_id =
        v_batch_id

  for update;


  if not found then

    raise exception
      'Batch % was not found',
      v_batch_id;

  end if;



  if upper(
    coalesce(
      v_batch.status,
      'OPEN'
    )
  ) in (
    'CLOSED',
    'CANCELLED',
    'CANCELED'
  )
  then

    raise exception
      'Batch % is already closed/cancelled',
      v_batch_id;

  end if;



  if not public.bb_has_location_access(
    v_batch.location_code
  )
  then

    raise exception
      'Batch Location access denied';

  end if;



  if p_type = 'BACK_SALE' then


    if not exists (

      select 1

      from public.locations

      where location_code =
            v_warehouse_code

        and active = true

    ) then

      raise exception
        'Warehouse Location % is not active',
        v_warehouse_code;

    end if;


    if not public.bb_has_location_access(
      v_warehouse_code
    )
    then

      raise exception
        'Warehouse Location access denied';

    end if;


    select location_name

    into v_warehouse_name

    from public.locations

    where location_code =
          v_warehouse_code;


  end if;



  if v_controller_id is not null then


    select staff_name

    into v_controller_name

    from public.staff

    where staff_id =
          v_controller_id

      and lower(
        coalesce(
          status,
          'active'
        )
      ) = 'active';


    if not found then

      raise exception
        'Inventory Controller was not found or is inactive';

    end if;


  end if;



  if jsonb_typeof(
    v_items
  ) <> 'array'

  or

  jsonb_array_length(
    v_items
  ) = 0

  then

    raise exception
      'Add at least one Product';

  end if;



  -- ==========================================================
  -- VALIDATE / LOCK ALL LINES
  -- ==========================================================

  for v_item in

    select value

    from jsonb_array_elements(
      v_items
    )

  loop


    if nullif(
      trim(
        coalesce(
          v_item->>'productCode',
          ''
        )
      ),
      ''
    ) is null
    then

      raise exception
        'Product Code is required';

    end if;



    if trim(
      v_item->>'productCode'
    )
    =
    any(
      v_seen
    )
    then

      raise exception
        'Product % was added more than once',
        v_item->>'productCode';

    end if;



    v_seen :=
      array_append(
        v_seen,
        trim(
          v_item->>'productCode'
        )
      );



    select *

    into v_product

    from public.products

    where product_code =
          trim(
            v_item->>'productCode'
          )

      and active = true;


    if not found then

      raise exception
        'Product % was not found or is inactive',
        v_item->>'productCode';

    end if;



    v_qty :=
      coalesce(
        nullif(
          v_item->>'qty',
          ''
        )::numeric,
        0
      );


    if v_qty <= 0 then

      raise exception
        '%: Qty must be greater than 0',
        v_product.product_name;

    end if;



    select *

    into v_batch_item

    from public.stock_batch_items

    where batch_id =
          v_batch_id

      and product_code =
          v_product.product_code

    for update;


    if not found then

      raise exception
        'Product % was not found in Batch %',
        v_product.product_code,
        v_batch_id;

    end if;



    if v_qty >
       v_batch_item.pending_qty_snapshot
       +
       0.000001
    then

      raise exception
        '%: requested % but Batch Remaining is only %',
        v_product.product_name,
        v_qty,
        v_batch_item.pending_qty_snapshot;

    end if;



    -- Batch Damage source handling:
    -- We currently allow Purchased source only.
    -- If Qty would cross into Zero-Cost, stop safely.

    if p_type = 'STOCK_DAMAGE'

       and

       v_qty >
       v_batch_item.purchased_pending_qty_snapshot
       +
       0.000001
    then

      raise exception
        '%: Damage Qty reaches Zero-Cost Batch stock. Zero-Cost Damage source rule is not enabled yet.',
        v_product.product_name;

    end if;


  end loop;



  v_movement_id :=
    public.bb_next_prefixed_id(
      'public.stock_activity'::regclass,
      'movement_id',
      'STK',
      6
    );



  -- ==========================================================
  -- WRITE LINES
  -- ==========================================================

  for v_item in

    select value

    from jsonb_array_elements(
      v_items
    )

  loop


    select *

    into v_product

    from public.products

    where product_code =
          trim(
            v_item->>'productCode'
          );



    select *

    into v_batch_item

    from public.stock_batch_items

    where batch_id =
          v_batch_id

      and product_code =
          v_product.product_code

    for update;



    v_qty :=
      nullif(
        v_item->>'qty',
        ''
      )::numeric;



    v_total :=
      v_total
      +
      v_qty;



    -- ========================================================
    -- BACK SALE
    -- ========================================================

    if p_type = 'BACK_SALE' then


      -- BB SOURCE SELECT V1: explicit split from operator; legacy payload retains previous default.
      if (v_item ? 'purchasedQty') or (v_item ? 'zeroCostQty') then
        if not (v_item ? 'purchasedQty') or not (v_item ? 'zeroCostQty') then
          raise exception '%: both Purchased and Zero-Cost return quantities are required',v_product.product_name;
        end if;
        v_purchased_back := coalesce(nullif(v_item->>'purchasedQty','')::numeric,0);
        v_zero_back := coalesce(nullif(v_item->>'zeroCostQty','')::numeric,0);
        if v_purchased_back < 0 or v_zero_back < 0
           or abs(v_purchased_back+v_zero_back-v_qty)>0.000001 then
          raise exception '%: returned source quantities must be nonnegative and equal total Back Sale Qty',v_product.product_name;
        end if;
        if v_purchased_back > v_batch_item.purchased_pending_qty_snapshot + 0.000001 then
          raise exception '%: Purchased return exceeds remaining Purchased Batch stock',v_product.product_name;
        end if;
      else
        v_purchased_back :=
        
                least(
        
                  v_qty,
        
                  greatest(
                    v_batch_item.purchased_pending_qty_snapshot,
                    0
                  )
        
                );
        
        
              v_zero_back :=
        
                greatest(
        
                  v_qty
                  -
                  v_purchased_back,
        
                  0
        
                );
      end if;

      if v_zero_back >
         v_batch_item.zero_cost_pending_qty_snapshot
         +
         0.000001
      then

        raise exception
          '%: Internal Batch source balance mismatch',
          v_product.product_name;

      end if;



      update public.stock_batch_items

      set

        pending_qty_snapshot =
          greatest(
            pending_qty_snapshot
            -
            v_qty,
            0
          ),


        purchased_pending_qty_snapshot =
          greatest(
            purchased_pending_qty_snapshot
            -
            v_purchased_back,
            0
          ),


        zero_cost_pending_qty_snapshot =
          greatest(
            zero_cost_pending_qty_snapshot
            -
            v_zero_back,
            0
          ),


        back_sale_qty =
          back_sale_qty
          +
          v_qty,


        purchased_back_sale_qty =
          purchased_back_sale_qty
          +
          v_purchased_back,


        zero_cost_back_sale_qty =
          zero_cost_back_sale_qty
          +
          v_zero_back,


        source_updated_at =
          now(),


        updated_at =
          now()


      where batch_id =
            v_batch_id

        and product_code =
            v_product.product_code;



      -- ======================================================
      -- PURCHASED BACK TO PURCHASED WAREHOUSE
      -- ======================================================

      if v_purchased_back > 0 then


        v_purchase_cost :=

          public.bb_stock_average_cost_internal(
            v_product.product_code
          );


        v_transaction_id :=

          public.bb_next_prefixed_id(

            'public.stock_activity'::regclass,

            'transaction_id',

            'TRX',

            6

          );



        insert into public.stock_activity(

          transaction_id,

          batch_id,

          activity_date,
          activity_type,

          product_code,
          product_name_snapshot,

          qty,

          unit_snapshot,

          location_code,

          from_location_code,
          to_location_code,

          inventory_controller_staff_id,
          inventory_controller_name_snapshot,

          salesman_staff_id,
          salesman_name_snapshot,

          driver_staff_id,
          driver_name_snapshot,

          driver2_staff_id,
          driver2_name_snapshot,

          reference_no,

          note,

          source_created_at,

          movement_id,

          flow,
          movement_type,

          from_bucket,
          to_bucket,

          source_entity_type,

          source_id,
          source_name,

          unit_cost,
          line_value,

          location_name_snapshot,

          client_request_id

        )
        values(

          v_transaction_id,

          v_batch_id,

          v_activity_date,
          'Back Sale',

          v_product.product_code,
          v_product.product_name,

          v_purchased_back,

          coalesce(
            v_product.unit,
            ''
          ),

          v_warehouse_code,

          v_batch.location_code,
          v_warehouse_code,

          v_controller_id,
          v_controller_name,

          v_batch.salesman_staff_id,
          v_batch.salesman_name_snapshot,

          v_batch.driver_staff_id,
          v_batch.driver_name_snapshot,

          v_batch.driver2_staff_id,
          v_batch.driver2_name_snapshot,

          v_reference_no,

          v_note,

          now(),

          v_movement_id,

          'INFLOW',
          'BACK_SALE',

          'BATCH_PENDING',
          'WAREHOUSE_GOOD',

          'BATCH',

          v_batch_id,
          coalesce(
            v_batch.salesman_name_snapshot,
            ''
          ),

          v_purchase_cost,

          round(
            v_purchased_back
            *
            v_purchase_cost,
            6
          ),

          coalesce(
            v_warehouse_name,
            v_warehouse_code
          ),

          v_request_id

        );


      end if;



      -- ======================================================
      -- ZERO-COST BACK TO ZERO-COST WAREHOUSE
      -- ======================================================

      if v_zero_back > 0 then


        v_transaction_id :=

          public.bb_next_prefixed_id(

            'public.stock_activity'::regclass,

            'transaction_id',

            'TRX',

            6

          );



        insert into public.stock_activity(

          transaction_id,

          batch_id,

          activity_date,
          activity_type,

          product_code,
          product_name_snapshot,

          qty,

          unit_snapshot,

          location_code,

          from_location_code,
          to_location_code,

          inventory_controller_staff_id,
          inventory_controller_name_snapshot,

          salesman_staff_id,
          salesman_name_snapshot,

          driver_staff_id,
          driver_name_snapshot,

          driver2_staff_id,
          driver2_name_snapshot,

          reference_no,

          note,

          source_created_at,

          movement_id,

          flow,
          movement_type,

          from_bucket,
          to_bucket,

          source_entity_type,

          source_id,
          source_name,

          unit_cost,
          line_value,

          location_name_snapshot,

          client_request_id

        )
        values(

          v_transaction_id,

          v_batch_id,

          v_activity_date,
          'Back Sale',

          v_product.product_code,
          v_product.product_name,

          v_zero_back,

          coalesce(
            v_product.unit,
            ''
          ),

          v_warehouse_code,

          v_batch.location_code,
          v_warehouse_code,

          v_controller_id,
          v_controller_name,

          v_batch.salesman_staff_id,
          v_batch.salesman_name_snapshot,

          v_batch.driver_staff_id,
          v_batch.driver_name_snapshot,

          v_batch.driver2_staff_id,
          v_batch.driver2_name_snapshot,

          v_reference_no,

          v_note,

          now(),

          v_movement_id,

          'INFLOW',
          'BACK_SALE',

          'BATCH_ZERO_COST',
          'WAREHOUSE_ZERO_COST',

          'BATCH',

          v_batch_id,
          coalesce(
            v_batch.salesman_name_snapshot,
            ''
          ),

          0,
          0,

          coalesce(
            v_warehouse_name,
            v_warehouse_code
          ),

          v_request_id

        );


      end if;



      v_lines :=

        v_lines

        ||

        jsonb_build_array(

          jsonb_build_object(


            'productCode',
              v_product.product_code,


            'productName',
              v_product.product_name,


            'qty',
              v_qty,


            'purchasedBackQty',
              v_purchased_back,


            'zeroCostBackQty',
              v_zero_back,


            'unit',
              coalesce(
                v_product.unit,
                ''
              )


          )

        );



      v_deltas :=

        v_deltas

        ||

        jsonb_build_array(

          jsonb_build_object(


            'productCode',
              v_product.product_code,


            'productName',
              v_product.product_name,


            'warehouseDelta',
              v_qty,


            'warehousePurchasedDelta',
              v_purchased_back,


            'warehouseZeroCostDelta',
              v_zero_back,


            'batchPendingDelta',
              -v_qty,


            'batchPurchasedDelta',
              -v_purchased_back,


            'batchZeroCostDelta',
              -v_zero_back,


            'totalGoodDelta',
              0,


            'damagedDelta',
              0,


            'batchId',
              v_batch_id


          )

        );



    -- ========================================================
    -- PURCHASED BATCH DAMAGE
    -- ========================================================

    else


      update public.stock_batch_items

      set

        pending_qty_snapshot =
          greatest(
            pending_qty_snapshot
            -
            v_qty,
            0
          ),


        purchased_pending_qty_snapshot =
          greatest(
            purchased_pending_qty_snapshot
            -
            v_qty,
            0
          ),


        damaged_qty =
          damaged_qty
          +
          v_qty,


        source_updated_at =
          now(),


        updated_at =
          now()


      where batch_id =
            v_batch_id

        and product_code =
            v_product.product_code;



      v_purchase_cost :=

        public.bb_stock_average_cost_internal(
          v_product.product_code
        );



      v_transaction_id :=

        public.bb_next_prefixed_id(

          'public.stock_activity'::regclass,

          'transaction_id',

          'TRX',

          6

        );



      insert into public.stock_activity(

        transaction_id,

        batch_id,

        activity_date,
        activity_type,

        product_code,
        product_name_snapshot,

        qty,

        unit_snapshot,

        location_code,

        from_location_code,

        inventory_controller_staff_id,
        inventory_controller_name_snapshot,

        salesman_staff_id,
        salesman_name_snapshot,

        driver_staff_id,
        driver_name_snapshot,

        driver2_staff_id,
        driver2_name_snapshot,

        reference_no,

        note,

        source_created_at,

        movement_id,

        flow,
        movement_type,

        from_bucket,
        to_bucket,

        source_entity_type,

        source_id,
        source_name,

        damage_source,

        unit_cost,
        line_value,

        location_name_snapshot,

        client_request_id

      )
      values(

        v_transaction_id,

        v_batch_id,

        v_activity_date,
        'Damaged Stock',

        v_product.product_code,
        v_product.product_name,

        v_qty,

        coalesce(
          v_product.unit,
          ''
        ),

        v_batch.location_code,

        v_batch.location_code,

        v_controller_id,
        v_controller_name,

        v_batch.salesman_staff_id,
        v_batch.salesman_name_snapshot,

        v_batch.driver_staff_id,
        v_batch.driver_name_snapshot,

        v_batch.driver2_staff_id,
        v_batch.driver2_name_snapshot,

        v_reference_no,

        v_note,

        now(),

        v_movement_id,

        'OUTFLOW',
        'STOCK_DAMAGE',

        'BATCH_PENDING',
        'DAMAGED',

        'BATCH',

        v_batch_id,
        coalesce(
          v_batch.salesman_name_snapshot,
          ''
        ),

        'BATCH',

        v_purchase_cost,

        round(
          v_qty
          *
          v_purchase_cost,
          6
        ),

        coalesce(
          v_batch.location_name_snapshot,
          v_batch.location_code
        ),

        v_request_id

      );



      v_lines :=

        v_lines

        ||

        jsonb_build_array(

          jsonb_build_object(

            'productCode',
              v_product.product_code,

            'productName',
              v_product.product_name,

            'qty',
              v_qty,

            'inventorySource',
              'PURCHASED',

            'unit',
              coalesce(
                v_product.unit,
                ''
              )

          )

        );



      v_deltas :=

        v_deltas

        ||

        jsonb_build_array(

          jsonb_build_object(

            'productCode',
              v_product.product_code,

            'productName',
              v_product.product_name,

            'warehouseDelta',
              0,

            'batchPendingDelta',
              -v_qty,

            'batchPurchasedDelta',
              -v_qty,

            'batchZeroCostDelta',
              0,

            'totalGoodDelta',
              -v_qty,

            'damagedDelta',
              v_qty,

            'batchId',
              v_batch_id

          )

        );


    end if;


  end loop;



  -- ==========================================================
  -- UPDATE BATCH HEADER
  -- ==========================================================

  if p_type = 'BACK_SALE' then


    update public.stock_batches

    set

      back_sale_qty =
        back_sale_qty
        +
        v_total,


      returned_qty =
        returned_qty
        +
        v_total,


      source_updated_at =
        now(),


      updated_at =
        now()


    where batch_id =
          v_batch_id;


  else


    update public.stock_batches

    set

      damaged_qty =
        damaged_qty
        +
        v_total,


      source_updated_at =
        now(),


      updated_at =
        now()


    where batch_id =
          v_batch_id;


  end if;



  perform public.bb_stock_refresh_batch_status_internal(
    v_batch_id
  );



  v_revision :=
    public.bb_stock_touch_revision_internal();



  v_response :=

    jsonb_build_object(


      'success',
        true,


      'version',
        'ZERO-COST-BATCH-V1',


      'revision',
        v_revision,


      'requestId',
        v_request_id,


      'movementId',
        v_movement_id,


      'batchId',
        v_batch_id,


      'flow',

        case
          when p_type = 'BACK_SALE'
          then 'INFLOW'
          else 'OUTFLOW'
        end,


      'movementType',
        p_type,


      'damageSource',

        case
          when p_type = 'STOCK_DAMAGE'
          then 'BATCH'
          else ''
        end,


      'inventoryAllocationRule',

        case
          when p_type = 'BACK_SALE'
          then 'PURCHASED_REMAINING_FIRST_ZERO_COST_REMAINDER'
          else 'PURCHASED_DAMAGE_ONLY_V1'
        end,


      'activityDate',
        v_activity_date::text,


      'lines',
        v_lines,


      'deltas',
        v_deltas,


      'message',

        case

          when p_type = 'BACK_SALE'

          then
            'Back Sale saved with automatic Purchased / Zero-Cost return allocation.'

          else
            'Batch Damage saved successfully.'

        end


    );



  insert into public.stock_movement_requests(

    request_id,
    movement_id,
    response_payload,
    created_by

  )
  values(

    v_request_id,
    v_movement_id,
    v_response,
    auth.uid()

  );


  return v_response;


end;

$function$
