/* =========================================================
   BIG BROTHER
   DAMAGED STOCK EXCHANGE RECEIVING — KEYIN V1

   INFLOW:
   Damage Exchange Received

   Exchange Pending -> Warehouse Good

   RULE:
   Replacement product is locked to SAME SKU.

   Supports:
   - Pending exchange selection
   - Partial receiving
   - Multiple exchange lines in one movement
   - Qty protection
   - Existing Stock save / idempotency system
   ========================================================= */

(function () {
  "use strict";

  const params =
    new URLSearchParams(
      location.search
    );

  const view =
    String(
      params.get("view") ||
      "keyin"
    ).toLowerCase();

  if (view !== "keyin") {
    return;
  }


  const TYPE =
    "DAMAGE_EXCHANGE_RECEIVE";

  let pendingRows = [];
  let pendingLoading = false;



  /* =======================================================
     HELPERS
     ======================================================= */

  function byId(id) {
    return document.getElementById(id);
  }


  function cleanText(value) {
    return String(
      value == null ? "" : value
    ).trim();
  }


  function numberValue(value) {

    const n =
      Number(value || 0);

    return Number.isFinite(n)
      ? n
      : 0;

  }


  function escapeHtml(value) {

    return cleanText(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function qtyText(value) {

    return numberValue(value)
      .toLocaleString(
        undefined,
        {
          maximumFractionDigits: 6
        }
      );

  }


  function moneyText(value) {

    return "$" +
      numberValue(value)
        .toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        );

  }


  function selectedPendingRow() {

    const id =
      cleanText(
        byId(
          "damageExchangePendingSelect"
        )?.value
      );

    if (!id) {
      return null;
    }

    return (
      pendingRows.find(
        row =>
          String(
            row.exchangeItemId
          ) === id
      ) || null
    );

  }



  /* =======================================================
     INSTALL INFLOW CATEGORY
     ======================================================= */

  function installCategory() {

    if (
      typeof FLOW_CATEGORIES ===
        "undefined" ||
      !FLOW_CATEGORIES.INFLOW
    ) {
      return;
    }


    if (
      !FLOW_CATEGORIES.INFLOW
        .some(
          item =>
            item.value === TYPE
        )
    ) {

      FLOW_CATEGORIES.INFLOW.push({
        value: TYPE,
        label:
          "Damaged Stock Exchange Received"
      });

    }


    /*
     * The page normally starts on INFLOW.
     * Because this helper loads after the
     * original page, also insert the option
     * into the currently visible select.
     */

    if (
      typeof flow !== "undefined" &&
      flow === "INFLOW"
    ) {

      const select =
        byId(
          "movementCategorySelect"
        );

      if (
        select &&
        ![
          ...select.options
        ].some(
          option =>
            option.value === TYPE
        )
      ) {

        const option =
          document.createElement(
            "option"
          );

        option.value = TYPE;

        option.textContent =
          "Damaged Stock Exchange Received";

        select.appendChild(
          option
        );

      }

    }

  }



  /* =======================================================
     INSTALL EXCHANGE RECEIVING UI
     ======================================================= */

  function installFields() {

    if (
      byId(
        "damageExchangeReceiveFields"
      )
    ) {
      return;
    }


    const productEntry =
      byId("productEntry");

    if (!productEntry) {
      return;
    }


    const box =
      document.createElement(
        "div"
      );

    box.id =
      "damageExchangeReceiveFields";

    box.className =
      "dynamic";

    box.hidden = true;


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
          🔄 Damage Exchange Pending
        </div>


        <div class="grid">

          <div
            class="field"
            style="grid-column:span 2"
          >

            <label>
              Pending Exchange
            </label>

            <select
              id="damageExchangePendingSelect"
              disabled
            >
              <option value="">
                Loading pending exchanges...
              </option>
            </select>

            <div
              id="damageExchangePendingHelp"
              class="helper"
            >
              Select the damaged-stock exchange
              that physically returned to our warehouse.
            </div>

          </div>


          <div class="field">

            <label>
              Receive Now Qty
            </label>

            <input
              id="damageExchangeReceiveQty"
              type="number"
              min="0"
              step="0.01"
              inputmode="decimal"
              placeholder="0"
              disabled
            >

            <div class="helper">
              Partial receiving is allowed.
            </div>

          </div>


          <div
            class="field"
            style="
              display:flex;
              align-items:flex-end;
            "
          >

            <button
              type="button"
              id="damageExchangeAddBtn"
              class="add-btn"
              style="width:100%"
              disabled
            >
              Add Exchange Product
            </button>

          </div>

        </div>


        <div
          id="damageExchangeDetail"
          class="client-detail"
          hidden
          style="margin-top:10px"
        >

          <div class="box">
            <small>
              Clearance Movement
            </small>
            <strong
              id="damageExchangeMovement"
            >
              -
            </strong>
          </div>


          <div class="box">
            <small>
              Product
            </small>
            <strong
              id="damageExchangeProduct"
            >
              -
            </strong>
          </div>


          <div class="box">
            <small>
              Exchange Qty
            </small>
            <strong
              id="damageExchangeQty"
            >
              0
            </strong>
          </div>


          <div class="box">
            <small>
              Already Received
            </small>
            <strong
              id="damageExchangeReceived"
            >
              0
            </strong>
          </div>


          <div class="box">
            <small>
              Remaining to Receive
            </small>
            <strong
              id="damageExchangeRemaining"
            >
              0
            </strong>
          </div>


          <div class="box">
            <small>
              Original Unit Cost
            </small>
            <strong
              id="damageExchangeCost"
            >
              $0.00
            </strong>
          </div>


          <div class="box">
            <small>
              Client / Supplier
            </small>
            <strong
              id="damageExchangeClient"
            >
              -
            </strong>
          </div>


          <div class="box">
            <small>
              Exchange Document / Ref
            </small>
            <strong
              id="damageExchangeReference"
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
          ✓ Replacement SKU is locked to the
          original damaged SKU.
          Warehouse Good increases only when
          the physical replacement is received.
        </div>

      </div>

    `;


    productEntry
      .insertAdjacentElement(
        "beforebegin",
        box
      );


    byId(
      "damageExchangePendingSelect"
    ).addEventListener(
      "change",
      function () {

        renderPendingDetail();

        try {
          clearSaveRequestState();
        } catch (_) {}

      }
    );


    byId(
      "damageExchangeReceiveQty"
    ).addEventListener(
      "input",
      function () {

        try {
          clearSaveRequestState();
        } catch (_) {}

      }
    );


    byId(
      "damageExchangeAddBtn"
    ).addEventListener(
      "click",
      addExchangeProduct
    );

  }



  /* =======================================================
     LOAD PENDING EXCHANGES FROM SUPABASE
     ======================================================= */

  async function loadPendingExchanges(
    silent = false
  ) {

    if (pendingLoading) {
      return;
    }


    const select =
      byId(
        "damageExchangePendingSelect"
      );

    const help =
      byId(
        "damageExchangePendingHelp"
      );

    if (
      !select ||
      !window.BBStockAdapter?.rpc
    ) {
      return;
    }


    pendingLoading = true;

    select.disabled = true;

    select.innerHTML =
      '<option value="">Loading pending exchanges...</option>';


    try {

      const result =
        await window.BBStockAdapter.rpc(
          "bb_stock_damage_exchange_pending",
          {
            p_limit: 500
          }
        );


      pendingRows =
        Array.isArray(
          result?.rows
        )
          ? result.rows
          : [];


      select.innerHTML =
        '<option value="">Select Pending Exchange</option>' +

        pendingRows
          .map(
            row => {

              const movement =
                cleanText(
                  row.clearanceMovementId
                ) || "No Movement";

              const product =
                cleanText(
                  row.productName
                ) ||
                cleanText(
                  row.productCode
                );

              const remaining =
                qtyText(
                  row.remainingQty
                );

              const unit =
                cleanText(
                  row.unit
                );

              return (
                '<option value="' +
                escapeHtml(
                  row.exchangeItemId
                ) +
                '">' +
                escapeHtml(
                  movement +
                  " · " +
                  product +
                  " · Remaining " +
                  remaining +
                  (unit
                    ? " " + unit
                    : "")
                ) +
                "</option>"
              );

            }
          )
          .join("");


      select.disabled =
        pendingRows.length === 0;


      if (help) {

        if (
          pendingRows.length
        ) {

          const totalRemaining =
            pendingRows.reduce(
              (sum, row) =>
                sum +
                numberValue(
                  row.remainingQty
                ),
              0
            );

          help.textContent =
            pendingRows.length +
            " pending exchange line" +
            (
              pendingRows.length === 1
                ? ""
                : "s"
            ) +
            " · " +
            qtyText(
              totalRemaining
            ) +
            " unit(s) waiting to be received.";

        } else {

          help.textContent =
            "No pending damaged-stock exchange is waiting for physical replacement.";

        }

      }


      renderPendingDetail();


      if (
        !silent &&
        movementType === TYPE
      ) {

        setStatus(
          pendingRows.length
            ? "Damage Exchange Pending loaded."
            : "No Damage Exchange Pending is waiting to be received.",
          pendingRows.length
            ? "success"
            : "warn"
        );

      }

    } catch (error) {

      pendingRows = [];

      select.innerHTML =
        '<option value="">Could not load pending exchanges</option>';

      select.disabled = true;


      if (help) {

        help.textContent =
          String(
            error?.message ||
            error
          );

      }


      if (
        !silent &&
        movementType === TYPE
      ) {

        setStatus(
          String(
            error?.message ||
            error
          ),
          "error"
        );

      }

    } finally {

      pendingLoading = false;

    }

  }



  /* =======================================================
     RENDER SELECTED PENDING EXCHANGE
     ======================================================= */

  function renderPendingDetail() {

    const row =
      selectedPendingRow();

    const detail =
      byId(
        "damageExchangeDetail"
      );

    const qtyInput =
      byId(
        "damageExchangeReceiveQty"
      );

    const addButton =
      byId(
        "damageExchangeAddBtn"
      );


    if (!row) {

      if (detail) {
        detail.hidden = true;
      }

      if (qtyInput) {

        qtyInput.value = "";
        qtyInput.disabled = true;

      }

      if (addButton) {
        addButton.disabled = true;
      }

      return;
    }


    const remaining =
      numberValue(
        row.remainingQty
      );


    detail.hidden = false;


    byId(
      "damageExchangeMovement"
    ).textContent =
      cleanText(
        row.clearanceMovementId
      ) || "-";


    byId(
      "damageExchangeProduct"
    ).textContent =

      (
        cleanText(
          row.productName
        ) || "-"
      ) +

      (
        cleanText(
          row.productCode
        )
          ? " · " +
            cleanText(
              row.productCode
            )
          : ""
      );


    byId(
      "damageExchangeQty"
    ).textContent =
      qtyText(
        row.exchangeQty
      );


    byId(
      "damageExchangeReceived"
    ).textContent =
      qtyText(
        row.receivedQty
      );


    byId(
      "damageExchangeRemaining"
    ).textContent =
      qtyText(
        remaining
      );


    byId(
      "damageExchangeCost"
    ).textContent =
      moneyText(
        row.unitCost
      );


    byId(
      "damageExchangeClient"
    ).textContent =
      cleanText(
        row.clientName
      ) ||
      cleanText(
        row.clientId
      ) ||
      "-";


    byId(
      "damageExchangeReference"
    ).textContent =
      cleanText(
        row.exchangeDocumentNo
      ) ||
      cleanText(
        row.referenceNo
      ) ||
      "-";


    qtyInput.disabled = false;

    qtyInput.max =
      String(
        remaining
      );

    qtyInput.value =
      remaining > 0
        ? String(
            remaining
          )
        : "";


    addButton.disabled =
      !(remaining > 0);

  }



  /* =======================================================
     ADD EXCHANGE PRODUCT TO MOVEMENT
     ======================================================= */

  function addExchangeProduct() {

    const row =
      selectedPendingRow();

    const receiveQty =
      numberValue(
        byId(
          "damageExchangeReceiveQty"
        )?.value
      );


    if (!row) {

      return setStatus(
        "Select a Pending Exchange first.",
        "error"
      );

    }


    const remaining =
      numberValue(
        row.remainingQty
      );


    if (!(receiveQty > 0)) {

      return setStatus(
        "Receive Now Qty must be greater than 0.",
        "error"
      );

    }


    if (
      receiveQty >
      remaining +
      0.000001
    ) {

      return setStatus(

        (
          cleanText(
            row.productName
          ) ||
          cleanText(
            row.productCode
          )
        ) +

        ": Receive Qty " +
        qtyText(
          receiveQty
        ) +

        " is greater than Exchange Remaining " +
        qtyText(
          remaining
        ) +
        ".",

        "error"

      );

    }


    const duplicate =
      items.some(
        item =>
          String(
            item.exchangeItemId ||
            ""
          ) ===
          String(
            row.exchangeItemId
          )
      );


    if (duplicate) {

      return setStatus(
        "This Pending Exchange is already added to the receiving list.",
        "error"
      );

    }


    items.push({

      exchangeItemId:
        row.exchangeItemId,

      clearanceMovementId:
        cleanText(
          row.clearanceMovementId
        ),

      clearanceTransactionId:
        cleanText(
          row.clearanceTransactionId
        ),

      productCode:
        cleanText(
          row.productCode
        ),

      productName:
        cleanText(
          row.productName
        ),

      unit:
        cleanText(
          row.unit
        ),

      qty:
        receiveQty,

      unitCost:
        numberValue(
          row.unitCost
        ),

      /*
       * Existing Stock table calls this
       * "Available Before".
       * For this movement it represents
       * remaining exchange qty before receipt.
       */
      availableBefore:
        remaining

    });


    renderItems();

    updatePreview();


    try {
      clearSaveRequestState();
    } catch (_) {}


    setStatus(

      items.length +
      " exchange product line" +
      (
        items.length === 1
          ? ""
          : "s"
      ) +
      " ready to receive.",

      "success"

    );


    byId(
      "damageExchangePendingSelect"
    ).value = "";

    renderPendingDetail();

  }



  /* =======================================================
     MODE DISPLAY
     ======================================================= */

  function syncMode() {

    const active =
      typeof movementType !==
        "undefined" &&
      movementType === TYPE;


    const fields =
      byId(
        "damageExchangeReceiveFields"
      );

    const productEntry =
      byId(
        "productEntry"
      );

    const manualPanel =
      byId(
        "manualProductPanel"
      );

    const saveButton =
      byId(
        "saveBtn"
      );


    if (fields) {
      fields.hidden = !active;
    }


    if (active) {

      /*
       * Keep the normal items table,
       * but hide normal product search.
       */
      if (manualPanel) {
        manualPanel.hidden = false;
      }

      if (productEntry) {
        productEntry.hidden = true;
      }


      [
        "purchaseFields",
        "receiveClientFields",
        "newBatchFields",
        "existingBatchFields",
        "damageFields",
        "allowanceFields",
        "damageClearFields"
      ].forEach(
        id => {

          const el =
            byId(id);

          if (el) {
            el.hidden = true;
          }

        }
      );


      if (saveButton) {

        saveButton.textContent =
          "Save Damage Exchange Received";

      }


      loadPendingExchanges(
        true
      );


      updatePreview();

    } else {

      if (productEntry) {
        productEntry.hidden = false;
      }


      if (
        saveButton &&
        saveButton.textContent ===
          "Save Damage Exchange Received"
      ) {

        saveButton.textContent =
          "Save Stock Movement";

      }

    }

  }



  /* =======================================================
     WRAP MOVEMENT LABEL
     ======================================================= */

  const baseMovementLabel =
    movementLabel;

  movementLabel =
    function () {

      if (
        movementType === TYPE
      ) {

        return (
          "Exchange Pending → Warehouse Good"
        );

      }

      return baseMovementLabel();

    };



  /* =======================================================
     WRAP PREVIEW DELTA
     ======================================================= */

  const baseDelta =
    delta;

  delta =
    function (item) {

      if (
        movementType === TYPE
      ) {

        const q =
          numberValue(
            item?.qty
          );

        return {

          warehouse:
            q,

          pending:
            0,

          damaged:
            0,

          company:
            q

        };

      }

      return baseDelta(
        item
      );

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
        movementType === TYPE
      ) {

        data.flow =
          "INFLOW";

        data.movementType =
          TYPE;

        data.damageSource =
          "";


        data.items =
          items.map(
            item => ({

              exchangeItemId:
                item.exchangeItemId,

              clearanceMovementId:
                cleanText(
                  item.clearanceMovementId
                ),

              productCode:
                cleanText(
                  item.productCode
                ),

              productName:
                cleanText(
                  item.productName
                ),

              unit:
                cleanText(
                  item.unit
                ),

              qty:
                numberValue(
                  item.qty
                ),

              unitCost:
                numberValue(
                  item.unitCost
                )

            })
          );

      }


      return data;

    };



  /* =======================================================
     VALIDATION
     ======================================================= */

  const baseValidate =
    validate;

  validate =
    function (data) {

      const error =
        baseValidate(
          data
        );

      if (error) {
        return error;
      }


      if (
        movementType !== TYPE
      ) {
        return "";
      }


      if (
        !Array.isArray(
          data.items
        ) ||
        data.items.length === 0
      ) {

        return (
          "Add at least one Damage Exchange product."
        );

      }


      const seen =
        new Set();


      for (
        const item
        of data.items
      ) {

        const exchangeId =
          String(
            item.exchangeItemId ||
            ""
          );


        if (!exchangeId) {

          return (
            "Exchange Item ID is missing."
          );

        }


        if (
          seen.has(
            exchangeId
          )
        ) {

          return (
            "The same Pending Exchange was added more than once."
          );

        }


        seen.add(
          exchangeId
        );


        const pending =
          pendingRows.find(
            row =>
              String(
                row.exchangeItemId
              ) ===
              exchangeId
          );


        if (!pending) {

          return (
            "One selected Pending Exchange is no longer available. Refresh and try again."
          );

        }


        const qty =
          numberValue(
            item.qty
          );

        const remaining =
          numberValue(
            pending.remainingQty
          );


        if (!(qty > 0)) {

          return (
            cleanText(
              item.productName
            ) +
            ": Receive Qty must be greater than 0."
          );

        }


        if (
          qty >
          remaining +
          0.000001
        ) {

          return (

            cleanText(
              item.productName
            ) +

            ": Receive Qty " +
            qtyText(
              qty
            ) +

            " is greater than Exchange Remaining " +
            qtyText(
              remaining
            ) +
            "."

          );

        }

      }


      return "";

    };



  /* =======================================================
     SAVE FINGERPRINT

     Include Exchange Item IDs so our existing
     duplicate-save protection knows exactly
     which pending exchanges are being received.
     ======================================================= */

  const baseBuildSaveFingerprint =
    buildSaveFingerprint;

  buildSaveFingerprint =
    function (data) {

      const raw =
        baseBuildSaveFingerprint(
          data
        );


      if (
        movementType !== TYPE
      ) {
        return raw;
      }


      try {

        const fingerprint =
          JSON.parse(
            raw
          );


        fingerprint
          .damageExchangeReceive =
          (
            data.items ||
            []
          ).map(
            item => ({

              exchangeItemId:
                String(
                  item.exchangeItemId ||
                  ""
                ),

              qty:
                numberValue(
                  item.qty
                )

            })
          );


        return JSON.stringify(
          fingerprint
        );

      } catch (_) {

        return raw;

      }

    };



  /* =======================================================
     WRAP MOVEMENT TYPE
     ======================================================= */

  const baseSetMovementType =
    setMovementType;

  setMovementType =
    function (type) {

      const result =
        baseSetMovementType(
          type
        );

      syncMode();

      return result;

    };



  /* =======================================================
     WRAP CLEAR FORM
     ======================================================= */

  const baseClearForm =
    clearForm;

  clearForm =
    function () {

      const result =
        baseClearForm();


      const select =
        byId(
          "damageExchangePendingSelect"
        );

      const qtyInput =
        byId(
          "damageExchangeReceiveQty"
        );


      if (select) {
        select.value = "";
      }

      if (qtyInput) {
        qtyInput.value = "";
      }


      renderPendingDetail();

      syncMode();

      return result;

    };



  /* =======================================================
     WRAP SAVE

     After successful/attempted exchange receive,
     reload pending balances from Supabase.
     ======================================================= */

  const baseSaveMovement =
    saveMovement;

  saveMovement =
    async function () {

      const wasExchange =
        movementType === TYPE;


      try {

        return await baseSaveMovement();

      } finally {

        if (wasExchange) {

          try {

            await loadPendingExchanges(
              true
            );

          } catch (_) {}

        }

      }

    };



  /* =======================================================
     REFRESH BUTTON

     Existing refresh still refreshes Stock.
     We additionally refresh Exchange Pending
     whenever this movement is active.
     ======================================================= */

  const refreshButton =
    byId(
      "refreshBtn"
    );

  if (refreshButton) {

    refreshButton
      .addEventListener(
        "click",
        function () {

          if (
            movementType === TYPE
          ) {

            setTimeout(
              function () {

                loadPendingExchanges(
                  true
                );

              },
              150
            );

          }

        }
      );

  }



  /* =======================================================
     REBIND BUTTONS THAT CAPTURE FUNCTION REFERENCES
     ======================================================= */

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


  if (
    byId(
      "saveBtn"
    )
  ) {

    byId(
      "saveBtn"
    ).onclick =
      saveMovement;

  }



  /* =======================================================
     START
     ======================================================= */

  installCategory();

  installFields();

  syncMode();

})();
