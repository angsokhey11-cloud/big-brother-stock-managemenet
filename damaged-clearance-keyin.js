/* =========================================================
   BIG BROTHER
   DAMAGED STOCK CLEARED — KEYIN V2

   OUTFLOW / TRANSFER
   -> Damaged Stock Cleared

   CLEARANCE TYPES:
   1. DEDUCT_AS_COST
   2. CLIENT_BUY_BACK
   3. EXCHANGE_FOR_GOOD_PRODUCTS

   EXCHANGE FOR GOOD PRODUCTS:
   - Client / Supplier required
   - Exchange Document No. required
   - Client comes from Supabase Client Master
   - Supabase validates official Client Name
   - FIFO Damage audit remains unchanged
   - Exchange Pending remains unchanged
   - Same Group Exchange Receive remains unchanged
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


  const EXCHANGE_TYPE =
    "EXCHANGE_FOR_GOOD_PRODUCTS";



  /* =======================================================
     STATE
     ======================================================= */

  let clearanceTypes =
    [];


  let exchangeClients =
    [];


  let clientsLoading =
    false;



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

  function selectedExchangeClient() {

    const select =
      byId(
        "damageExchangeClientSelect"
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

      exchangeClients.find(
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
     IS EXCHANGE
     ======================================================= */

  function isExchangeClearance() {

    return (

      cleanText(
        selectedClearanceType()
          ?.typeCode
      )

      ===

      EXCHANGE_TYPE

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
     INSTALL CLEARANCE UI
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



        <!-- ===============================================
             EXCHANGE DOCUMENT
             =============================================== -->

        <div
          id="damageExchangeDocumentFields"
          hidden
          style="
            margin-top:12px;
            padding-top:12px;
            border-top:1px solid #dbe6f3;
          "
        >

          <div
            style="
              font-size:11px;
              font-weight:1000;
              color:#176d4b;
              margin-bottom:9px;
            "
          >
            🔄 Exchange Document Information
          </div>


          <div class="grid">


            <div class="field">

              <label>
                Client / Supplier
              </label>

              <select
                id="damageExchangeClientSelect"
                disabled
              >

                <option value="">
                  Loading Clients...
                </option>

              </select>

              <div
                id="damageExchangeClientHelp"
                class="helper"
              >
                Select the Client responsible
                for replacing the damaged goods.
              </div>

            </div>



            <div class="field">

              <label>
                Exchange Document No.
              </label>

              <input
                id="damageExchangeDocumentNo"
                type="text"
                autocomplete="off"
                placeholder="Example: EX-2026-001"
              >

              <div class="helper">
                Required for Exchange for Good products.
              </div>

            </div>


          </div>



          <div
            id="damageExchangeSelectedClient"
            class="client-detail"
            hidden
            style="margin-top:10px"
          >

            <div class="box">

              <small>
                Client ID
              </small>

              <strong
                id="damageExchangeClientIdView"
              >
                -
              </strong>

            </div>


            <div class="box">

              <small>
                Client Name
              </small>

              <strong
                id="damageExchangeClientNameView"
              >
                -
              </strong>

            </div>


            <div class="box">

              <small>
                Client Code
              </small>

              <strong
                id="damageExchangeClientCodeView"
              >
                -
              </strong>

            </div>

          </div>



          <div
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
            ✓ This Client and Exchange Document will
            stay linked to the Exchange Pending record
            until the physical replacement is received.
          </div>

        </div>



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

        syncExchangeDocumentFields();

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
      "damageExchangeClientSelect"
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
      "damageExchangeDocumentNo"
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
        clearanceTypes.length === 0;


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


      syncExchangeDocumentFields();


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
     LOAD EXCHANGE CLIENTS
     ======================================================= */

  async function loadExchangeClients() {

    if (
      clientsLoading
    ) {

      return;

    }


    const select =
      byId(
        "damageExchangeClientSelect"
      );


    const help =
      byId(
        "damageExchangeClientHelp"
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


      const result =

        await window
          .BBStockAdapter
          .rpc(
            "bb_stock_damage_exchange_clients"
          );


      exchangeClients =

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

          exchangeClients.length

            ? (
                exchangeClients.length +
                " active Client" +
                (
                  exchangeClients.length === 1
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


      exchangeClients =
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
     RENDER CLIENT OPTIONS
     ======================================================= */

  function renderClientOptions() {

    const select =
      byId(
        "damageExchangeClientSelect"
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

      exchangeClients
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
      exchangeClients.length === 0;


    if (

      previous

      &&

      exchangeClients.some(
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
     RENDER SELECTED CLIENT
     ======================================================= */

  function renderSelectedClient() {

    const client =
      selectedExchangeClient();


    const panel =
      byId(
        "damageExchangeSelectedClient"
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
        "damageExchangeClientIdView"
      ).textContent =
        "-";


      byId(
        "damageExchangeClientNameView"
      ).textContent =
        "-";


      byId(
        "damageExchangeClientCodeView"
      ).textContent =
        "-";


      return;

    }


    panel.hidden =
      false;


    byId(
      "damageExchangeClientIdView"
    ).textContent =

      cleanText(
        client.clientId
      )

      ||

      "-";


    byId(
      "damageExchangeClientNameView"
    ).textContent =

      cleanText(
        client.clientName
      )

      ||

      "-";


    byId(
      "damageExchangeClientCodeView"
    ).textContent =

      cleanText(
        client.clientCode
      )

      ||

      "-";

  }



  /* =======================================================
     EXCHANGE DOCUMENT PANEL
     ======================================================= */

  function syncExchangeDocumentFields() {

    const panel =
      byId(
        "damageExchangeDocumentFields"
      );


    if (
      !panel
    ) {

      return;

    }


    const exchange =
      isExchangeClearance();


    panel.hidden =
      !exchange;


    if (
      exchange
    ) {


      if (
        !exchangeClients.length

        &&

        !clientsLoading
      ) {

        loadExchangeClients();

      }


      renderSelectedClient();


    } else {


      const clientSelect =
        byId(
          "damageExchangeClientSelect"
        );


      const documentInput =
        byId(
          "damageExchangeDocumentNo"
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

    }

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


      syncExchangeDocumentFields();

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
     START INSTALL
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
          cleanText(
            chosen.typeCode
          ) ===
          EXCHANGE_TYPE
        ) {


          const client =
            selectedExchangeClient();


          const documentNo =
            cleanText(
              byId(
                "damageExchangeDocumentNo"
              )?.value
            );


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

              " · Doc " +
              documentNo;

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


        const client =
          selectedExchangeClient();


        const exchange =
          cleanText(
            chosen?.typeCode
          ) ===
          EXCHANGE_TYPE;


        data.flow =
          "OUTFLOW";


        data.movementType =
          TYPE;


        data.damageSource =
          "";


        data.clearanceType =
          cleanText(
            chosen?.typeCode
          );


        data.clearanceTypeLabel =
          cleanText(
            chosen?.label
          );


        /*
         * Supabase validates Client ID
         * and resolves official Client Name.
         */

        data.clientId =

          exchange

            ? cleanText(
                client?.clientId
              )

            : "";


        data.exchangeDocumentNo =

          exchange

            ? cleanText(
                byId(
                  "damageExchangeDocumentNo"
                )?.value
              )

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



      /* ---------------------------------------------------
         Clearance Types
         --------------------------------------------------- */

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



      /* ---------------------------------------------------
         Exchange Client + Document
         --------------------------------------------------- */

      if (
        cleanText(
          data.clearanceType
        ) ===
        EXCHANGE_TYPE
      ) {


        if (
          !exchangeClients.length
        ) {

          return (
            "Exchange Client list is not available yet."
          );

        }


        if (
          !cleanText(
            data.clientId
          )
        ) {

          return (
            "Select the Client / Supplier for this Damage Exchange."
          );

        }


        if (
          !selectedExchangeClient()
        ) {

          return (
            "Selected Exchange Client is not available in Client Master."
          );

        }


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



      /* ---------------------------------------------------
         Damaged Availability
         --------------------------------------------------- */

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
          "damageExchangeClientSelect"
        );


      const documentInput =
        byId(
          "damageExchangeDocumentNo"
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


      renderSelectedClient();

      syncMode();


      return result;

    };



  /* =======================================================
     REBIND ORIGINAL BUTTON REFERENCES
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

  loadExchangeClients();

  syncMode();


})();
