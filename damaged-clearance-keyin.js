/* =========================================================
   BIG BROTHER
   DAMAGED STOCK CLEARED — KEYIN V3

   OUTFLOW / TRANSFER
   -> Damaged Stock Cleared

   CLEARANCE TYPES:

   1. DEDUCT_AS_COST
      - No Client required
      - No document required

   2. CLIENT_BUY_BACK
      - Client / Supplier required
      - Recovery Document No. required
      - Creates Recovery Pending work item

   3. EXCHANGE_FOR_GOOD_PRODUCTS
      - Client / Supplier required
      - Exchange Document No. required
      - Creates Exchange Pending work item

   Existing functions preserved:
   - Damaged Stock availability
   - FIFO clearance audit
   - Partial clearance
   - Same Group Exchange receiving
   - Preview / validation
   - Existing Stock save flow
   ========================================================= */

(function () {

  "use strict";


  /* =======================================================
     PAGE
     ======================================================= */

  const params =
    new URLSearchParams(
      location.search
    );


  const view =
    String(
      params.get("view") ||
      "keyin"
    ).toLowerCase();


  if (
    view !== "keyin"
  ) {

    return;

  }



  /* =======================================================
     CONSTANTS
     ======================================================= */

  const TYPE =
    "DAMAGE_CLEAR";


  const BUY_BACK_TYPE =
    "CLIENT_BUY_BACK";


  const EXCHANGE_TYPE =
    "EXCHANGE_FOR_GOOD_PRODUCTS";


  const COST_TYPE =
    "DEDUCT_AS_COST";



  /* =======================================================
     STATE
     ======================================================= */

  let clearanceTypes =
    [];


  let recoveryClients =
    [];


  let clientsLoading =
    false;


  let lastClearanceType =
    "";



  /* =======================================================
     HELPERS
     ======================================================= */

  function byId(
    id
  ) {

    return document
      .getElementById(
        id
      );

  }


  function cleanText(
    value
  ) {

    return String(
      value == null
        ? ""
        : value
    ).trim();

  }


  function escapeHtml(
    value
  ) {

    return cleanText(
      value
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }


  function clearanceCode() {

    return cleanText(
      selectedClearanceType()
        ?.typeCode
    );

  }


  function needsClient() {

    const type =
      clearanceCode();


    return (
      type === BUY_BACK_TYPE
      ||
      type === EXCHANGE_TYPE
    );

  }


  function isBuyBack() {

    return (
      clearanceCode() ===
      BUY_BACK_TYPE
    );

  }


  function isExchange() {

    return (
      clearanceCode() ===
      EXCHANGE_TYPE
    );

  }



  /* =======================================================
     SELECTED CLEARANCE TYPE
     ======================================================= */

  function selectedClearanceType() {

    const select =
      byId(
        "damageClearanceTypeSelect"
      );


    const code =
      cleanText(
        select?.value
      );


    return (

      clearanceTypes.find(
        item =>
          cleanText(
            item.typeCode
          ) === code
      )

      ||

      null

    );

  }



  /* =======================================================
     SELECTED CLIENT
     ======================================================= */

  function selectedRecoveryClient() {

    const select =
      byId(
        "damageRecoveryClientSelect"
      );


    const clientId =
      cleanText(
        select?.value
      );


    if (
      !clientId
    ) {

      return null;

    }


    return (

      recoveryClients.find(
        client =>
          cleanText(
            client.clientId
          ) === clientId
      )

      ||

      null

    );

  }



  /* =======================================================
     DOCUMENT
     ======================================================= */

  function currentDocumentNo() {

    return cleanText(
      byId(
        "damageRecoveryDocumentNo"
      )?.value
    );

  }



  /* =======================================================
     INSTALL OUTFLOW CATEGORY
     ======================================================= */

  function installCategory() {

    if (

      typeof FLOW_CATEGORIES ===
        "undefined"

      ||

      !FLOW_CATEGORIES.OUTFLOW

    ) {

      return;

    }


    if (

      !FLOW_CATEGORIES.OUTFLOW
        .some(
          item =>
            item.value ===
            TYPE
        )

    ) {

      FLOW_CATEGORIES.OUTFLOW.push({

        value:
          TYPE,

        label:
          "Damaged Stock Cleared"

      });

    }

  }



  /* =======================================================
     INSTALL UI
     ======================================================= */

  function installFields() {

    if (
      byId(
        "damageClearFields"
      )
    ) {

      return;

    }


    const anchor =
      byId(
        "damageFields"
      );


    if (
      !anchor
    ) {

      return;

    }


    const box =
      document.createElement(
        "div"
      );


    box.id =
      "damageClearFields";


    box.className =
      "dynamic";


    box.hidden =
      true;


    box.innerHTML = `

      <div
        style="
          border:1px solid #d7e5f6;
          background:#f7fbff;
          border-radius:11px;
          padding:12px;
          margin-bottom:11px;
        "
      >

        <div
          style="
            font-size:12px;
            font-weight:1000;
            color:#173f77;
            margin-bottom:10px;
          "
        >
          ⚠️ Damaged Stock Outflow
        </div>


        <!-- =============================================
             CLEARANCE TYPE
             ============================================= -->

        <div class="grid">

          <div class="field">

            <label>
              Clearance Type
            </label>

            <select
              id="damageClearanceTypeSelect"
              disabled
            >

              <option value="">
                Loading clearance options...
              </option>

            </select>

            <div
              id="damageClearanceTypeHelp"
              class="helper"
            >
              Choose why this damaged stock
              is being cleared.
            </div>

          </div>

        </div>



        <!-- =============================================
             CLIENT / RECOVERY DOCUMENT
             ============================================= -->

        <div
          id="damageRecoveryFields"
          hidden
          style="
            margin-top:12px;
            padding-top:12px;
            border-top:1px solid #dbe6f3;
          "
        >


          <div
            id="damageRecoveryTitle"
            style="
              font-size:11px;
              font-weight:1000;
              color:#176d4b;
              margin-bottom:9px;
            "
          >
            Client / Supplier Information
          </div>


          <div class="grid">


            <!-- CLIENT -->

            <div class="field">

              <label>
                Client / Supplier
              </label>

              <select
                id="damageRecoveryClientSelect"
                disabled
              >

                <option value="">
                  Loading Clients...
                </option>

              </select>

              <div
                id="damageRecoveryClientHelp"
                class="helper"
              >
                Select Client / Supplier.
              </div>

            </div>



            <!-- DOCUMENT -->

            <div class="field">

              <label id="damageRecoveryDocumentLabel">
                Document No.
              </label>

              <input
                id="damageRecoveryDocumentNo"
                type="text"
                autocomplete="off"
                placeholder="Document No."
              >

              <div
                id="damageRecoveryDocumentHelp"
                class="helper"
              >
                Required.
              </div>

            </div>


          </div>



          <!-- ===========================================
               SELECTED CLIENT DETAIL
               =========================================== -->

          <div
            id="damageRecoverySelectedClient"
            class="client-detail"
            hidden
            style="margin-top:10px"
          >


            <div class="box">

              <small>
                Client ID
              </small>

              <strong
                id="damageRecoveryClientIdView"
              >
                -
              </strong>

            </div>


            <div class="box">

              <small>
                Client Name
              </small>

              <strong
                id="damageRecoveryClientNameView"
              >
                -
              </strong>

            </div>


            <div class="box">

              <small>
                Client Code
              </small>

              <strong
                id="damageRecoveryClientCodeView"
              >
                -
              </strong>

            </div>


          </div>



          <!-- ===========================================
               BUSINESS MESSAGE
               =========================================== -->

          <div
            id="damageRecoveryMessage"
            style="
              margin-top:9px;
              padding:8px 10px;
              border-radius:8px;
              background:#edf9f3;
              color:#176d4b;
              font-size:9px;
              font-weight:800;
              line-height:1.5;
            "
          >
          </div>


        </div>



        <!-- =============================================
             STOCK MESSAGE
             ============================================= -->

        <div
          class="helper"
          style="
            margin-top:9px;
          "
        >
          Damaged Stock decreases when this movement
          is saved. Warehouse Good and Batch Pending
          do not change.
        </div>


      </div>

    `;


    anchor.insertAdjacentElement(
      "afterend",
      box
    );



    /* =====================================================
       CLEARANCE TYPE EVENT
       ===================================================== */

    byId(
      "damageClearanceTypeSelect"
    ).addEventListener(

      "change",

      function () {


        syncRecoveryFields(
          true
        );


        updatePreview();


        try {

          clearSaveRequestState();

        } catch (_) {}


      }

    );



    /* =====================================================
       CLIENT EVENT
       ===================================================== */

    byId(
      "damageRecoveryClientSelect"
    ).addEventListener(

      "change",

      function () {


        renderSelectedClient();


        updatePreview();


        try {

          clearSaveRequestState();

        } catch (_) {}


      }

    );



    /* =====================================================
       DOCUMENT EVENT
       ===================================================== */

    byId(
      "damageRecoveryDocumentNo"
    ).addEventListener(

      "input",

      function () {


        updatePreview();


        try {

          clearSaveRequestState();

        } catch (_) {}


      }

    );

  }



  /* =======================================================
     LOAD CLEARANCE TYPES
     ======================================================= */

  async function loadClearanceTypes() {

    const select =
      byId(
        "damageClearanceTypeSelect"
      );


    const help =
      byId(
        "damageClearanceTypeHelp"
      );


    if (

      !select

      ||

      !window
        .BBStockAdapter
        ?.rpc

    ) {

      return;

    }


    try {


      const result =

        await window
          .BBStockAdapter
          .rpc(
            "bb_stock_damage_clearance_types"
          );


      clearanceTypes =

        Array.isArray(
          result?.rows
        )

          ? result.rows

          : [];


      select.innerHTML =

        '<option value="">' +
        'Select Damaged Stock outflow' +
        '</option>'

        +

        clearanceTypes
          .map(
            item =>

              '<option value="' +

              escapeHtml(
                item.typeCode
              ) +

              '">' +

              escapeHtml(
                item.label
              ) +

              '</option>'

          )
          .join("");


      select.disabled =
        clearanceTypes.length ===
        0;


      if (
        help
      ) {


        help.textContent =

          clearanceTypes.length

            ? (
                clearanceTypes.length +
                " clearance options configured · " +
                "selection is saved permanently for audit and accounting."
              )

            : (
                "No Damaged Stock clearance options are configured."
              );

      }


      syncRecoveryFields(
        false
      );


    } catch (
      error
    ) {


      clearanceTypes =
        [];


      select.innerHTML =

        '<option value="">' +
        'Could not load clearance options' +
        '</option>';


      select.disabled =
        true;


      if (
        help
      ) {

        help.textContent =
          String(
            error?.message ||
            error
          );

      }

    }

  }



  /* =======================================================
     LOAD CLIENTS
     ======================================================= */

  async function loadRecoveryClients() {

    if (
      clientsLoading
    ) {

      return;

    }


    const select =
      byId(
        "damageRecoveryClientSelect"
      );


    const help =
      byId(
        "damageRecoveryClientHelp"
      );


    if (

      !select

      ||

      !window
        .BBStockAdapter
        ?.rpc

    ) {

      return;

    }


    clientsLoading =
      true;


    select.disabled =
      true;


    select.innerHTML =

      '<option value="">' +
      'Loading Clients...' +
      '</option>';


    try {


      /*
       * Existing RPC name says exchange,
       * but it returns the common active Client Master.
       *
       * We reuse it for both:
       * - Client Buy Back
       * - Exchange for Good products
       */

      const result =

        await window
          .BBStockAdapter
          .rpc(
            "bb_stock_damage_exchange_clients"
          );


      recoveryClients =

        Array.isArray(
          result?.rows
        )

          ? result.rows

          : [];


      renderClientOptions();


      if (
        help
      ) {


        help.textContent =

          recoveryClients.length

            ? (
                recoveryClients.length +
                " active Client" +
                (
                  recoveryClients.length === 1
                    ? ""
                    : "s"
                ) +
                " available from Client Master."
              )

            : (
                "No active Clients are available."
              );

      }


    } catch (
      error
    ) {


      recoveryClients =
        [];


      select.innerHTML =

        '<option value="">' +
        'Could not load Clients' +
        '</option>';


      select.disabled =
        true;


      if (
        help
      ) {

        help.textContent =
          String(
            error?.message ||
            error
          );

      }


    } finally {


      clientsLoading =
        false;


      renderSelectedClient();

    }

  }



  /* =======================================================
     CLIENT OPTIONS
     ======================================================= */

  function renderClientOptions() {

    const select =
      byId(
        "damageRecoveryClientSelect"
      );


    if (
      !select
    ) {

      return;

    }


    const previous =
      cleanText(
        select.value
      );


    select.innerHTML =

      '<option value="">' +
      'Select Client / Supplier' +
      '</option>'

      +

      recoveryClients
        .map(
          client => {


            const clientName =
              cleanText(
                client.clientName
              );


            const clientCode =
              cleanText(
                client.clientCode
              );


            const label =

              clientName

              +

              (
                clientCode
                  ? " — " +
                    clientCode
                  : ""
              );


            return (

              '<option value="' +

              escapeHtml(
                client.clientId
              ) +

              '">' +

              escapeHtml(
                label
              ) +

              '</option>'

            );

          }
        )
        .join("");


    select.disabled =
      recoveryClients.length ===
      0;


    if (

      previous

      &&

      recoveryClients.some(
        client =>
          cleanText(
            client.clientId
          ) === previous
      )

    ) {

      select.value =
        previous;

    }


    renderSelectedClient();

  }



  /* =======================================================
     SELECTED CLIENT DETAIL
     ======================================================= */

  function renderSelectedClient() {

    const client =
      selectedRecoveryClient();


    const panel =
      byId(
        "damageRecoverySelectedClient"
      );


    if (
      !panel
    ) {

      return;

    }


    if (
      !client
    ) {


      panel.hidden =
        true;


      byId(
        "damageRecoveryClientIdView"
      ).textContent =
        "-";


      byId(
        "damageRecoveryClientNameView"
      ).textContent =
        "-";


      byId(
        "damageRecoveryClientCodeView"
      ).textContent =
        "-";


      return;

    }


    panel.hidden =
      false;


    byId(
      "damageRecoveryClientIdView"
    ).textContent =

      cleanText(
        client.clientId
      )

      ||

      "-";


    byId(
      "damageRecoveryClientNameView"
    ).textContent =

      cleanText(
        client.clientName
      )

      ||

      "-";


    byId(
      "damageRecoveryClientCodeView"
    ).textContent =

      cleanText(
        client.clientCode
      )

      ||

      "-";

  }



  /* =======================================================
     CLIENT / DOCUMENT PANEL
     ======================================================= */

  function syncRecoveryFields(
    clearDocumentOnTypeChange = false
  ) {

    const panel =
      byId(
        "damageRecoveryFields"
      );


    if (
      !panel
    ) {

      return;

    }


    const type =
      clearanceCode();


    const requiresClient =
      needsClient();


    /*
     * When changing between:
     * Exchange <-> Buy Back
     *
     * clear the old document so an Exchange Doc cannot
     * accidentally become a Recovery Doc or vice versa.
     */

    if (

      clearDocumentOnTypeChange

      &&

      lastClearanceType

      &&

      lastClearanceType !== type

    ) {


      const documentInput =
        byId(
          "damageRecoveryDocumentNo"
        );


      if (
        documentInput
      ) {

        documentInput.value =
          "";

      }

    }


    lastClearanceType =
      type;


    panel.hidden =
      !requiresClient;


    if (
      !requiresClient
    ) {


      const clientSelect =
        byId(
          "damageRecoveryClientSelect"
        );


      const documentInput =
        byId(
          "damageRecoveryDocumentNo"
        );


      if (
        clientSelect
      ) {

        clientSelect.value =
          "";

      }


      if (
        documentInput
      ) {

        documentInput.value =
          "";

      }


      renderSelectedClient();


      return;

    }



    /* =====================================================
       CLIENT LIST
       ===================================================== */

    if (

      !recoveryClients.length

      &&

      !clientsLoading

    ) {

      loadRecoveryClients();

    }



    /* =====================================================
       BUY BACK MODE
       ===================================================== */

    if (
      type ===
      BUY_BACK_TYPE
    ) {


      byId(
        "damageRecoveryTitle"
      ).textContent =
        "💳 Client Buy Back Recovery Information";


      byId(
        "damageRecoveryDocumentLabel"
      ).textContent =
        "Recovery Document No.";


      byId(
        "damageRecoveryDocumentNo"
      ).placeholder =
        "Example: RCV-2026-001";


      byId(
        "damageRecoveryDocumentHelp"
      ).textContent =
        "Required for Client Buy Back recovery.";


      byId(
        "damageRecoveryMessage"
      ).textContent =

        "✓ A Recovery Pending work item will be created " +
        "for Accounting. Stock clearance does not mean " +
        "the money has already been received.";


    }



    /* =====================================================
       EXCHANGE MODE
       ===================================================== */

    if (
      type ===
      EXCHANGE_TYPE
    ) {


      byId(
        "damageRecoveryTitle"
      ).textContent =
        "🔄 Exchange Document Information";


      byId(
        "damageRecoveryDocumentLabel"
      ).textContent =
        "Exchange Document No.";


      byId(
        "damageRecoveryDocumentNo"
      ).placeholder =
        "Example: EX-2026-001";


      byId(
        "damageRecoveryDocumentHelp"
      ).textContent =
        "Required for Exchange for Good products.";


      byId(
        "damageRecoveryMessage"
      ).textContent =

        "✓ This Client and Exchange Document will stay " +
        "linked to the Exchange Pending record until the " +
        "physical replacement stock is received.";


    }


    renderSelectedClient();

  }



  /* =======================================================
     MODE
     ======================================================= */

  function syncMode() {

    const active =

      typeof movementType !==
        "undefined"

      &&

      movementType ===
        TYPE;


    const fields =
      byId(
        "damageClearFields"
      );


    if (
      fields
    ) {

      fields.hidden =
        !active;

    }


    if (
      active
    ) {


      [

        "purchaseFields",

        "receiveClientFields",

        "newBatchFields",

        "existingBatchFields",

        "damageFields",

        "allowanceFields"

      ].forEach(
        id => {


          const el =
            byId(
              id
            );


          if (
            el
          ) {

            el.hidden =
              true;

          }

        }
      );


      const save =
        byId(
          "saveBtn"
        );


      if (
        save
      ) {

        save.textContent =
          "Save Damaged Stock Cleared";

      }


      syncRecoveryFields(
        false
      );


      updateProductAvailability();


      updatePreview();


    } else {


      const save =
        byId(
          "saveBtn"
        );


      if (

        save

        &&

        save.textContent ===
          "Save Damaged Stock Cleared"

      ) {

        save.textContent =
          "Save Stock Movement";

      }

    }

  }



  /* =======================================================
     INSTALL
     ======================================================= */

  installCategory();

  installFields();



  /* =======================================================
     AVAILABLE QTY
     ======================================================= */

  const baseCurrentAvailable =
    currentAvailable;


  currentAvailable =
    function (
      code
    ) {


      if (
        movementType ===
        TYPE
      ) {

        return num(
          stockFor(
            code
          ).damaged
        );

      }


      return baseCurrentAvailable(
        code
      );

    };



  /* =======================================================
     AVAILABLE LABEL
     ======================================================= */

  const baseAvailableLabel =
    availableLabel;


  availableLabel =
    function () {


      if (
        movementType ===
        TYPE
      ) {

        return "Damaged Stock";

      }


      return baseAvailableLabel();

    };



  /* =======================================================
     PRODUCT POOL
     ======================================================= */

  const baseManualProductPool =
    manualProductPool;


  manualProductPool =
    function () {


      if (
        movementType ===
        TYPE
      ) {


        return products.filter(
          product =>

            num(
              stockFor(
                product.productCode
              ).damaged
            )

            >

            0.000001

        );

      }


      return baseManualProductPool();

    };



  /* =======================================================
     MOVEMENT LABEL
     ======================================================= */

  const baseMovementLabel =
    movementLabel;


  movementLabel =
    function () {


      if (
        movementType ===
        TYPE
      ) {


        const chosen =
          selectedClearanceType();


        if (
          !chosen
        ) {

          return (
            "Damaged → Cleared"
          );

        }


        let label =

          "Damaged → Cleared · " +
          chosen.label;


        if (
          needsClient()
        ) {


          const client =
            selectedRecoveryClient();


          const documentNo =
            currentDocumentNo();


          if (
            client
          ) {

            label +=

              " · " +

              (
                cleanText(
                  client.clientName
                )

                ||

                cleanText(
                  client.clientId
                )

              );

          }


          if (
            documentNo
          ) {


            label +=

              isBuyBack()

                ? (
                    " · Recovery " +
                    documentNo
                  )

                : (
                    " · Exchange " +
                    documentNo
                  );

          }

        }


        return label;

      }


      return baseMovementLabel();

    };



  /* =======================================================
     STOCK DELTA
     ======================================================= */

  const baseDelta =
    delta;


  delta =
    function (
      item
    ) {


      if (
        movementType ===
        TYPE
      ) {


        const q =
          num(
            item?.qty
          );


        return {

          warehouse:
            0,

          pending:
            0,

          damaged:
            -q,

          company:
            0

        };

      }


      return baseDelta(
        item
      );

    };



  /* =======================================================
     ADD PRODUCT VALIDATION
     ======================================================= */

  const baseAddProduct =
    addProduct;


  addProduct =
    function () {


      if (
        movementType ===
        TYPE
      ) {


        const product =
          selectedProduct;


        const q =
          num(
            byId(
              "qty"
            )?.value
          );


        if (
          !product
        ) {

          return setStatus(
            "Select a damaged Product first.",
            "error"
          );

        }


        if (
          !(q > 0)
        ) {

          return setStatus(
            "Qty must be greater than 0.",
            "error"
          );

        }


        const available =
          num(
            currentAvailable(
              product.productCode
            )
          );


        if (
          q >
          available +
          0.000001
        ) {


          return setStatus(

            product.productName +

            ": Qty " +

            q +

            " is greater than Damaged Stock " +

            available +

            ".",

            "error"

          );

        }

      }


      return baseAddProduct();

    };



  /* =======================================================
     BUILD SAVE PAYLOAD
     ======================================================= */

  const baseBuildPayload =
    buildPayload;


  buildPayload =
    function () {


      const data =
        baseBuildPayload();


      if (
        movementType ===
        TYPE
      ) {


        const chosen =
          selectedClearanceType();


        const type =
          cleanText(
            chosen?.typeCode
          );


        const client =
          selectedRecoveryClient();


        const documentNo =
          currentDocumentNo();


        data.flow =
          "OUTFLOW";


        data.movementType =
          TYPE;


        data.damageSource =
          "";


        data.clearanceType =
          type;


        data.clearanceTypeLabel =
          cleanText(
            chosen?.label
          );



        /* ===============================================
           CLIENT

           Required only for:
           - Buy Back
           - Exchange
           =============================================== */

        data.clientId =

          (
            type === BUY_BACK_TYPE
            ||
            type === EXCHANGE_TYPE
          )

            ? cleanText(
                client?.clientId
              )

            : "";



        /* ===============================================
           EXCHANGE DOCUMENT
           =============================================== */

        data.exchangeDocumentNo =

          type ===
          EXCHANGE_TYPE

            ? documentNo

            : "";



        /* ===============================================
           RECOVERY DOCUMENT
           =============================================== */

        data.recoveryDocumentNo =

          type ===
          BUY_BACK_TYPE

            ? documentNo

            : "";

      }


      return data;

    };



  /* =======================================================
     VALIDATE
     ======================================================= */

  const baseValidate =
    validate;


  validate =
    function (
      data
    ) {


      const error =
        baseValidate(
          data
        );


      if (
        error
      ) {

        return error;

      }


      if (
        movementType !==
        TYPE
      ) {

        return "";

      }



      /* ===================================================
         CLEARANCE TYPE
         =================================================== */

      if (
        !clearanceTypes.length
      ) {

        return (
          "Damaged Stock clearance options are not configured."
        );

      }


      if (
        !cleanText(
          data?.clearanceType
        )
      ) {

        return (
          "Select a Damaged Stock outflow option."
        );

      }



      const type =
        cleanText(
          data.clearanceType
        );



      /* ===================================================
         CLIENT
         =================================================== */

      if (

        type ===
        BUY_BACK_TYPE

        ||

        type ===
        EXCHANGE_TYPE

      ) {


        if (
          !recoveryClients.length
        ) {

          return (
            "Client / Supplier list is not available yet."
          );

        }


        if (
          !cleanText(
            data.clientId
          )
        ) {

          return (
            "Select the Client / Supplier for this transaction."
          );

        }


        if (
          !selectedRecoveryClient()
        ) {

          return (
            "Selected Client / Supplier is not available in Client Master."
          );

        }

      }



      /* ===================================================
         CLIENT BUY BACK DOCUMENT
         =================================================== */

      if (
        type ===
        BUY_BACK_TYPE
      ) {


        if (
          !cleanText(
            data.recoveryDocumentNo
          )
        ) {

          return (
            "Recovery Document No. is required for Client Buy Back."
          );

        }

      }



      /* ===================================================
         EXCHANGE DOCUMENT
         =================================================== */

      if (
        type ===
        EXCHANGE_TYPE
      ) {


        if (
          !cleanText(
            data.exchangeDocumentNo
          )
        ) {

          return (
            "Exchange Document No. is required."
          );

        }

      }



      /* ===================================================
         DAMAGED AVAILABILITY
         =================================================== */

      for (
        const item
        of data.items || []
      ) {


        const available =
          num(
            stockFor(
              item.productCode
            ).damaged
          );


        if (

          num(
            item.qty
          )

          >

          available +
          0.000001

        ) {


          return (

            item.productName +

            ": Qty " +

            num(
              item.qty
            ) +

            " is greater than Damaged Stock " +

            available +

            "."

          );

        }

      }


      return "";

    };



  /* =======================================================
     SAVE FINGERPRINT
     ======================================================= */

  const baseBuildSaveFingerprint =
    buildSaveFingerprint;


  buildSaveFingerprint =
    function (
      data
    ) {


      const raw =
        baseBuildSaveFingerprint(
          data
        );


      try {


        const fingerprint =
          JSON.parse(
            raw
          );


        fingerprint.clearanceType =
          cleanText(
            data?.clearanceType
          );


        fingerprint.clientId =
          cleanText(
            data?.clientId
          );


        fingerprint.exchangeDocumentNo =
          cleanText(
            data?.exchangeDocumentNo
          );


        fingerprint.recoveryDocumentNo =
          cleanText(
            data?.recoveryDocumentNo
          );


        return JSON.stringify(
          fingerprint
        );


      } catch (_) {


        return raw;

      }

    };



  /* =======================================================
     SET MOVEMENT TYPE
     ======================================================= */

  const baseSetMovementType =
    setMovementType;


  setMovementType =
    function (
      type
    ) {


      const result =
        baseSetMovementType(
          type
        );


      syncMode();


      return result;

    };



  /* =======================================================
     CLEAR FORM
     ======================================================= */

  const baseClearForm =
    clearForm;


  clearForm =
    function () {


      const result =
        baseClearForm();


      const clearanceSelect =
        byId(
          "damageClearanceTypeSelect"
        );


      const clientSelect =
        byId(
          "damageRecoveryClientSelect"
        );


      const documentInput =
        byId(
          "damageRecoveryDocumentNo"
        );


      if (
        clearanceSelect
      ) {

        clearanceSelect.value =
          "";

      }


      if (
        clientSelect
      ) {

        clientSelect.value =
          "";

      }


      if (
        documentInput
      ) {

        documentInput.value =
          "";

      }


      lastClearanceType =
        "";


      renderSelectedClient();


      syncMode();


      return result;

    };



  /* =======================================================
     REBIND BUTTONS
     ======================================================= */

  if (
    byId(
      "addProductBtn"
    )
  ) {

    byId(
      "addProductBtn"
    ).onclick =
      addProduct;

  }


  if (
    byId(
      "clearBtn"
    )
  ) {

    byId(
      "clearBtn"
    ).onclick =
      clearForm;

  }



  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  loadClearanceTypes();

  loadRecoveryClients();

  syncMode();


})();
