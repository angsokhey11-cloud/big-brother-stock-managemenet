/* =========================================================
   BIG BROTHER
   DAMAGED STOCK EXCHANGE RECEIVING — KEYIN V2

   INFLOW:
   Damaged Stock Exchange Received

   RULES:
   - Same SKU allowed
   - Different SKU allowed only inside same Product Group
   - Partial receiving allowed
   - Actual received SKU goes to Warehouse Good
   - Original damaged SKU remains linked for audit
   ========================================================= */

(function () {
  "use strict";

  const params = new URLSearchParams(location.search);
  const view = String(params.get("view") || "keyin").toLowerCase();

  if (view !== "keyin") return;

  const TYPE = "DAMAGE_EXCHANGE_RECEIVE";

  let pendingRows = [];
  let pendingLoading = false;

  let allowedProducts = [];
  let allowedGroupCode = "";
  let allowedGroupName = "";
  let allowedForExchangeId = "";


  /* =======================================================
     HELPERS
     ======================================================= */

  function byId(id) {
    return document.getElementById(id);
  }

  function cleanText(value) {
    return String(value == null ? "" : value).trim();
  }

  function numberValue(value) {
    const n = Number(value || 0);
    return Number.isFinite(n) ? n : 0;
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
    return numberValue(value).toLocaleString(
      undefined,
      { maximumFractionDigits: 6 }
    );
  }

  function moneyText(value) {
    return "$" + numberValue(value).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
  }

  function selectedPendingRow() {
    const id = cleanText(
      byId("damageExchangePendingSelect")?.value
    );

    if (!id) return null;

    return pendingRows.find(
      row =>
        String(row.exchangeItemId) === id
    ) || null;
  }

  function selectedReplacementProduct() {
    const code = cleanText(
      byId("damageExchangeReplacementSelect")?.value
    );

    if (!code) return null;

    return allowedProducts.find(
      row =>
        cleanText(row.productCode) === code
    ) || null;
  }


  /* =======================================================
     CATEGORY
     ======================================================= */

  function installCategory() {

    if (
      typeof FLOW_CATEGORIES === "undefined" ||
      !FLOW_CATEGORIES.INFLOW
    ) {
      return;
    }

    if (
      !FLOW_CATEGORIES.INFLOW.some(
        item => item.value === TYPE
      )
    ) {
      FLOW_CATEGORIES.INFLOW.push({
        value: TYPE,
        label: "Damaged Stock Exchange Received"
      });
    }

    if (
      typeof flow !== "undefined" &&
      flow === "INFLOW"
    ) {

      const select = byId("movementCategorySelect");

      if (
        select &&
        ![...select.options].some(
          option =>
            option.value === TYPE
        )
      ) {

        const option =
          document.createElement("option");

        option.value = TYPE;
        option.textContent =
          "Damaged Stock Exchange Received";

        select.appendChild(option);
      }
    }
  }


  /* =======================================================
     INSTALL UI
     ======================================================= */

  function installFields() {

    if (byId("damageExchangeReceiveFields")) {
      return;
    }

    const productEntry = byId("productEntry");

    if (!productEntry) {
      return;
    }

    const box = document.createElement("div");

    box.id = "damageExchangeReceiveFields";
    box.className = "dynamic";
    box.hidden = true;

    box.innerHTML = `

      <div style="
        border:1px solid #d7e5f6;
        background:#f7fbff;
        border-radius:11px;
        padding:12px;
        margin-bottom:11px;
      ">

        <div style="
          font-size:12px;
          font-weight:1000;
          color:#173f77;
          margin-bottom:10px;
        ">
          🔄 Damage Exchange Pending
        </div>


        <div class="grid">

          <div class="field">

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
              Select an exchange waiting for
              physical replacement.
            </div>

          </div>


          <div class="field">

            <label>
              Replacement Product
            </label>

            <select
              id="damageExchangeReplacementSelect"
              disabled
            >
              <option value="">
                Select Pending Exchange first
              </option>
            </select>

            <div
              id="damageExchangeReplacementHelp"
              class="helper"
            >
              Only products allowed by the
              same Product Group will appear.
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
            <small>Clearance Movement</small>
            <strong id="damageExchangeMovement">-</strong>
          </div>

          <div class="box">
            <small>Original Damaged Product</small>
            <strong id="damageExchangeProduct">-</strong>
          </div>

          <div class="box">
            <small>Product Group</small>
            <strong id="damageExchangeGroup">-</strong>
          </div>

          <div class="box">
            <small>Exchange Qty</small>
            <strong id="damageExchangeQty">0</strong>
          </div>

          <div class="box">
            <small>Already Received</small>
            <strong id="damageExchangeReceived">0</strong>
          </div>

          <div class="box">
            <small>Remaining to Receive</small>
            <strong id="damageExchangeRemaining">0</strong>
          </div>

          <div class="box">
            <small>Original Unit Cost</small>
            <strong id="damageExchangeCost">$0.00</strong>
          </div>

          <div class="box">
            <small>Client / Supplier</small>
            <strong id="damageExchangeClient">-</strong>
          </div>

          <div class="box">
            <small>Exchange Document / Ref</small>
            <strong id="damageExchangeReference">-</strong>
          </div>

        </div>


        <div style="
          margin-top:9px;
          padding:8px 10px;
          border-radius:8px;
          background:#edf9f3;
          color:#176d4b;
          font-size:9px;
          font-weight:800;
          line-height:1.5;
        ">
          ✓ Replacement can use the original SKU
          or another active SKU inside the same
          Product Group. Warehouse Good increases
          only for the actual product received.
        </div>

      </div>
    `;

    productEntry.insertAdjacentElement(
      "beforebegin",
      box
    );


    byId("damageExchangePendingSelect")
      .addEventListener(
        "change",
        async function () {

          renderPendingDetail();

          await loadAllowedProducts(
            selectedPendingRow()
          );

          updateAddButton();

          try {
            clearSaveRequestState();
          } catch (_) {}
        }
      );


    byId("damageExchangeReplacementSelect")
      .addEventListener(
        "change",
        function () {

          updateAddButton();

          try {
            clearSaveRequestState();
          } catch (_) {}
        }
      );


    byId("damageExchangeReceiveQty")
      .addEventListener(
        "input",
        function () {

          updateAddButton();

          try {
            clearSaveRequestState();
          } catch (_) {}
        }
      );


    byId("damageExchangeAddBtn")
      .addEventListener(
        "click",
        addExchangeProduct
      );
  }


  /* =======================================================
     RESET ALLOWED PRODUCTS
     ======================================================= */

  function resetAllowedProducts() {

    allowedProducts = [];
    allowedGroupCode = "";
    allowedGroupName = "";
    allowedForExchangeId = "";

    const select =
      byId("damageExchangeReplacementSelect");

    if (select) {
      select.innerHTML =
        '<option value="">Select Pending Exchange first</option>';

      select.disabled = true;
    }

    const help =
      byId("damageExchangeReplacementHelp");

    if (help) {
      help.textContent =
        "Only products allowed by the same Product Group will appear.";
    }

    const group =
      byId("damageExchangeGroup");

    if (group) {
      group.textContent = "-";
    }

    updateAddButton();
  }


  /* =======================================================
     LOAD SAME-GROUP PRODUCTS
     ======================================================= */

  async function loadAllowedProducts(row) {

    resetAllowedProducts();

    if (!row) return;

    const exchangeId =
      String(row.exchangeItemId);

    allowedForExchangeId =
      exchangeId;

    const select =
      byId("damageExchangeReplacementSelect");

    const help =
      byId("damageExchangeReplacementHelp");

    select.disabled = true;

    select.innerHTML =
      '<option value="">Loading allowed replacement products...</option>';

    try {

      const result =
        await window.BBStockAdapter.rpc(
          "bb_stock_damage_exchange_allowed_products",
          {
            p_exchange_item_id:
              Number(row.exchangeItemId)
          }
        );


      /*
       * User may select another pending exchange
       * while the RPC is loading.
       */
      if (
        String(
          selectedPendingRow()?.exchangeItemId || ""
        ) !== exchangeId
      ) {
        return;
      }


      allowedProducts =
        Array.isArray(result?.rows)
          ? result.rows
          : [];

      allowedGroupCode =
        cleanText(result?.groupCode);

      allowedGroupName =
        cleanText(result?.groupName);


      select.innerHTML =
        '<option value="">Select Replacement Product</option>' +

        allowedProducts.map(
          product => {

            const same =
              product.sameSku === true
                ? " · Original SKU"
                : " · Same Group";

            return (
              '<option value="' +
              escapeHtml(product.productCode) +
              '">' +
              escapeHtml(
                cleanText(product.productName) +
                " — " +
                cleanText(product.productCode) +
                same
              ) +
              "</option>"
            );
          }
        ).join("");


      select.disabled =
        allowedProducts.length === 0;


      /*
       * Default to the original SKU.
       */
      const original =
        allowedProducts.find(
          product =>
            cleanText(product.productCode) ===
            cleanText(row.productCode)
        );

      if (original) {
        select.value =
          original.productCode;
      }


      if (allowedGroupName) {

        help.textContent =
          "Product Group: " +
          allowedGroupName +
          " · " +
          allowedProducts.length +
          " allowed replacement SKU" +
          (
            allowedProducts.length === 1
              ? ""
              : "s"
          ) +
          ".";

      } else {

        help.textContent =
          "This product has no active Product Group · original SKU only.";

      }


      const group =
        byId("damageExchangeGroup");

      if (group) {

        group.textContent =
          allowedGroupName
            ? (
                allowedGroupName +
                (
                  allowedGroupCode
                    ? " · " +
                      allowedGroupCode
                    : ""
                )
              )
            : "Original SKU only";
      }


      updateAddButton();

    } catch (error) {

      allowedProducts = [];

      select.innerHTML =
        '<option value="">Could not load replacement products</option>';

      select.disabled = true;

      if (help) {
        help.textContent =
          String(
            error?.message ||
            error
          );
      }

      updateAddButton();

      if (movementType === TYPE) {

        setStatus(
          String(
            error?.message ||
            error
          ),
          "error"
        );
      }
    }
  }


  /* =======================================================
     LOAD PENDING EXCHANGES
     ======================================================= */

  async function loadPendingExchanges(
    silent = false
  ) {

    if (pendingLoading) return;

    const select =
      byId("damageExchangePendingSelect");

    const help =
      byId("damageExchangePendingHelp");

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
        Array.isArray(result?.rows)
          ? result.rows
          : [];


      select.innerHTML =
        '<option value="">Select Pending Exchange</option>' +

        pendingRows.map(
          row => {

            const movement =
              cleanText(
                row.clearanceMovementId
              ) || "No Movement";

            const product =
              cleanText(row.productName) ||
              cleanText(row.productCode);

            const remaining =
              qtyText(row.remainingQty);

            const unit =
              cleanText(row.unit);

            return (
              '<option value="' +
              escapeHtml(row.exchangeItemId) +
              '">' +
              escapeHtml(
                movement +
                " · " +
                product +
                " · Remaining " +
                remaining +
                (
                  unit
                    ? " " + unit
                    : ""
                )
              ) +
              "</option>"
            );
          }
        ).join("");


      select.disabled =
        pendingRows.length === 0;


      if (help) {

        if (pendingRows.length) {

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
            qtyText(totalRemaining) +
            " unit(s) waiting to be received.";

        } else {

          help.textContent =
            "No pending damaged-stock exchange is waiting for physical replacement.";
        }
      }


      renderPendingDetail();
      resetAllowedProducts();


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
     PENDING DETAIL
     ======================================================= */

  function renderPendingDetail() {

    const row =
      selectedPendingRow();

    const detail =
      byId("damageExchangeDetail");

    const qtyInput =
      byId("damageExchangeReceiveQty");


    if (!row) {

      if (detail) {
        detail.hidden = true;
      }

      if (qtyInput) {
        qtyInput.value = "";
        qtyInput.disabled = true;
      }

      resetAllowedProducts();

      return;
    }


    const remaining =
      numberValue(
        row.remainingQty
      );


    detail.hidden = false;


    byId("damageExchangeMovement")
      .textContent =
        cleanText(
          row.clearanceMovementId
        ) || "-";


    byId("damageExchangeProduct")
      .textContent =
        (
          cleanText(row.productName) ||
          "-"
        ) +
        (
          cleanText(row.productCode)
            ? " · " +
              cleanText(row.productCode)
            : ""
        );


    byId("damageExchangeQty")
      .textContent =
        qtyText(row.exchangeQty);


    byId("damageExchangeReceived")
      .textContent =
        qtyText(row.receivedQty);


    byId("damageExchangeRemaining")
      .textContent =
        qtyText(remaining);


    byId("damageExchangeCost")
      .textContent =
        moneyText(row.unitCost);


    byId("damageExchangeClient")
      .textContent =
        cleanText(row.clientName) ||
        cleanText(row.clientId) ||
        "-";


    byId("damageExchangeReference")
      .textContent =
        cleanText(
          row.exchangeDocumentNo
        ) ||
        cleanText(
          row.referenceNo
        ) ||
        "-";


    qtyInput.disabled = false;

    qtyInput.max =
      String(remaining);

    qtyInput.value =
      remaining > 0
        ? String(remaining)
        : "";


    updateAddButton();
  }


  /* =======================================================
     ADD BUTTON STATE
     ======================================================= */

  function updateAddButton() {

    const button =
      byId("damageExchangeAddBtn");

    if (!button) return;

    const row =
      selectedPendingRow();

    const replacement =
      selectedReplacementProduct();

    const receiveQty =
      numberValue(
        byId(
          "damageExchangeReceiveQty"
        )?.value
      );

    const remaining =
      numberValue(
        row?.remainingQty
      );


    button.disabled =
      !row ||
      !replacement ||
      !(receiveQty > 0) ||
      receiveQty >
        remaining + 0.000001;
  }


  /* =======================================================
     ADD RECEIVING LINE
     ======================================================= */

  function addExchangeProduct() {

    const row =
      selectedPendingRow();

    const replacement =
      selectedReplacementProduct();

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


    if (!replacement) {

      return setStatus(
        "Select the Replacement Product.",
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
      remaining + 0.000001
    ) {

      return setStatus(
        (
          cleanText(row.productName) ||
          cleanText(row.productCode)
        ) +
        ": Receive Qty " +
        qtyText(receiveQty) +
        " is greater than Exchange Remaining " +
        qtyText(remaining) +
        ".",
        "error"
      );
    }


    /*
     * One pending exchange line may be
     * received once inside each save movement.
     *
     * Additional partial receipts can be
     * entered in the next receiving movement.
     */
    const duplicate =
      items.some(
        item =>
          String(
            item.exchangeItemId || ""
          ) ===
          String(
            row.exchangeItemId
          )
      );


    if (duplicate) {

      return setStatus(
        "This Pending Exchange is already added to this receiving movement.",
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

      originalProductCode:
        cleanText(
          row.productCode
        ),

      originalProductName:
        cleanText(
          row.productName
        ),

      replacementProductCode:
        cleanText(
          replacement.productCode
        ),

      productCode:
        cleanText(
          replacement.productCode
        ),

      productName:
        cleanText(
          replacement.productName
        ),

      unit:
        cleanText(
          replacement.unit
        ) ||
        cleanText(
          row.unit
        ),

      productGroupCode:
        allowedGroupCode,

      productGroupName:
        allowedGroupName,

      qty:
        receiveQty,

      /*
       * Preview table keeps the original
       * damage cost before server save.
       * Supabase V2 calculates the actual
       * received SKU stock cost.
       */
      unitCost:
        numberValue(
          row.unitCost
        ),

      availableBefore:
        remaining

    });


    renderItems();

    updatePreview();


    try {
      clearSaveRequestState();
    } catch (_) {}


    setStatus(
      (
        cleanText(
          replacement.productName
        ) ||
        cleanText(
          replacement.productCode
        )
      ) +
      " · " +
      qtyText(receiveQty) +
      " unit(s) ready to receive into Warehouse Good.",
      "success"
    );


    byId(
      "damageExchangePendingSelect"
    ).value = "";

    renderPendingDetail();
  }


  /* =======================================================
     MODE
     ======================================================= */

  function syncMode() {

    const active =
      typeof movementType !== "undefined" &&
      movementType === TYPE;

    const fields =
      byId(
        "damageExchangeReceiveFields"
      );

    const productEntry =
      byId("productEntry");

    const manualPanel =
      byId("manualProductPanel");

    const saveButton =
      byId("saveBtn");


    if (fields) {
      fields.hidden = !active;
    }


    if (active) {

      if (manualPanel) {
        manualPanel.hidden = false;
      }

      /*
       * Exchange must use our controlled
       * Replacement Product selector.
       */
      if (productEntry) {
        productEntry.hidden = true;
        productEntry.style.display =
          "none";
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

          const el = byId(id);

          if (el) {
            el.hidden = true;
          }
        }
      );


      if (saveButton) {
        saveButton.textContent =
          "Save Damage Exchange Received";
      }


      loadPendingExchanges(true);

      updatePreview();

    } else {

      if (productEntry) {
        productEntry.hidden = false;
        productEntry.style.display = "";
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
     MOVEMENT LABEL
     ======================================================= */

  const baseMovementLabel =
    movementLabel;

  movementLabel =
    function () {

      if (movementType === TYPE) {

        return (
          "Exchange Pending → Warehouse Good"
        );
      }

      return baseMovementLabel();
    };


  /* =======================================================
     PREVIEW DELTA
     ======================================================= */

  const baseDelta =
    delta;

  delta =
    function (item) {

      if (movementType === TYPE) {

        const q =
          numberValue(item?.qty);

        return {
          warehouse: q,
          pending: 0,
          damaged: 0,
          company: q
        };
      }

      return baseDelta(item);
    };


  /* =======================================================
     BUILD PAYLOAD
     ======================================================= */

  const baseBuildPayload =
    buildPayload;

  buildPayload =
    function () {

      const data =
        baseBuildPayload();


      if (movementType === TYPE) {

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

              originalProductCode:
                cleanText(
                  item.originalProductCode
                ),

              replacementProductCode:
                cleanText(
                  item.replacementProductCode
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
     VALIDATE
     ======================================================= */

  const baseValidate =
    validate;

  validate =
    function (data) {

      const error =
        baseValidate(data);

      if (error) {
        return error;
      }


      if (movementType !== TYPE) {
        return "";
      }


      if (
        !Array.isArray(data.items) ||
        data.items.length === 0
      ) {

        return (
          "Add at least one Damage Exchange product."
        );
      }


      const seen =
        new Set();


      for (const item of data.items) {

        const exchangeId =
          String(
            item.exchangeItemId || ""
          );


        if (!exchangeId) {

          return (
            "Exchange Item ID is missing."
          );
        }


        if (seen.has(exchangeId)) {

          return (
            "The same Pending Exchange was added more than once."
          );
        }


        seen.add(exchangeId);


        if (
          !cleanText(
            item.replacementProductCode
          )
        ) {

          return (
            "Replacement Product is required."
          );
        }


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
          numberValue(item.qty);

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
          remaining + 0.000001
        ) {

          return (
            cleanText(
              item.productName
            ) +
            ": Receive Qty " +
            qtyText(qty) +
            " is greater than Exchange Remaining " +
            qtyText(remaining) +
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
    function (data) {

      const raw =
        baseBuildSaveFingerprint(data);


      if (movementType !== TYPE) {
        return raw;
      }


      try {

        const fingerprint =
          JSON.parse(raw);


        fingerprint.damageExchangeReceive =
          (data.items || []).map(
            item => ({

              exchangeItemId:
                String(
                  item.exchangeItemId ||
                  ""
                ),

              replacementProductCode:
                cleanText(
                  item.replacementProductCode
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
     SET MOVEMENT TYPE
     ======================================================= */

  const baseSetMovementType =
    setMovementType;

  setMovementType =
    function (type) {

      const result =
        baseSetMovementType(type);

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


      const pendingSelect =
        byId(
          "damageExchangePendingSelect"
        );

      const qtyInput =
        byId(
          "damageExchangeReceiveQty"
        );


      if (pendingSelect) {
        pendingSelect.value = "";
      }

      if (qtyInput) {
        qtyInput.value = "";
      }


      resetAllowedProducts();

      renderPendingDetail();

      syncMode();

      return result;
    };


  /* =======================================================
     SAVE MOVEMENT
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
     REFRESH
     ======================================================= */

  const refreshButton =
    byId("refreshBtn");

  if (refreshButton) {

    refreshButton.addEventListener(
      "click",
      function () {

        if (
          movementType === TYPE
        ) {

          setTimeout(
            function () {
              loadPendingExchanges(true);
            },
            150
          );
        }
      }
    );
  }


  /* =======================================================
     REBIND
     ======================================================= */

  if (byId("clearBtn")) {
    byId("clearBtn").onclick =
      clearForm;
  }

  if (byId("saveBtn")) {
    byId("saveBtn").onclick =
      saveMovement;
  }


  /* =======================================================
     START
     ======================================================= */

  installCategory();
  installFields();
  syncMode();

})();
