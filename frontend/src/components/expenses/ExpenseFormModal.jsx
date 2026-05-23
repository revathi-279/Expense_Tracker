import { useForm } from "react-hook-form";

import { useState } from "react";

import api from "../../services/api";

import {
  useMonthStore,
} from "../../store/monthStore";

import {
  modalOverlay,
  modalCard,
  inputClass,
  selectClass,
  labelClass,
  primaryBtn,
  secondaryBtn,
  errorClass,
  modalActions,
} from "../../styles/common";

const MAX_EXPENSE =
  10000000;

function ExpenseFormModal({
  expense,
  onClose,
  onSaved,
}) {

  const {
    selectedDate,
  } = useMonthStore();

  const isEditMode =
    Boolean(expense);

  const [
    apiError,
    setApiError,
  ] = useState("");

  // ============================================
  // INHERITED INCOME STATES
  // ============================================

  const [
    showIncomeConfirm,
    setShowIncomeConfirm,
  ] = useState(false);

  const [
    inheritedIncome,
    setInheritedIncome,
  ] = useState(null);

  const [
    editableIncome,
    setEditableIncome,
  ] = useState("");

  const [
    pendingExpense,
    setPendingExpense,
  ] = useState(null);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm({

    defaultValues: {

      amount:
        expense?.amount || "",

      category:
        expense?.category || "",

      item:
        expense?.item || "",

      expenseDate:
        expense?.expenseDate

          ? toDateInputValue(
              expense.expenseDate
            )

          : selectedDate,
    },
  });

  // ============================================
  // SAVE ACTUAL EXPENSE
  // ============================================

  const saveExpenseToDB =
    async (
      payload
    ) => {

      if (
        isEditMode
      ) {

        await api.put(
          `/expense-api/updateExpense/${expense._id}`,
          payload
        );

      } else {

        await api.post(
          "/expense-api/addExpense",
          payload
        );
      }

      await onSaved();
    };

  // ============================================
  // MAIN SUBMIT
  // ============================================

  const saveExpense =
    async (data) => {

      try {

        setApiError("");

        const expenseMonth =
          data.expenseDate
            .slice(0, 7);

        // =====================================
        // CHECK INCOME
        // =====================================

        const incomeRes =
          await api.get(
            `/income-api/readIncome?month=${expenseMonth}`
          );

        const incomeData =
          incomeRes.data;

        // =====================================
        // NO INCOME FOUND
        // =====================================

        if (
          !incomeData.payload
        ) {

          setApiError(
            "Please add income for this month"
          );

          return;
        }

        // =====================================
        // PREPARE PAYLOAD
        // =====================================

        const parsedAmount =
          parseInt(
            data.amount
          );

        const payload = {

          amount:
            parsedAmount,

          category:
            data.category,

          item:
            data.item.trim(),

          expenseDate:
            data.expenseDate,
        };

        // =====================================
        // INHERITED INCOME
        // =====================================

        if (
          incomeData.inherited &&
          !isEditMode
        ) {

          setInheritedIncome(
            incomeData.payload
          );

          setEditableIncome(
            incomeData.payload
              ?.income || ""
          );

          setPendingExpense(
            payload
          );

          setShowIncomeConfirm(
            true
          );

          return;
        }

        // =====================================
        // NORMAL SAVE
        // =====================================

        await saveExpenseToDB(
          payload
        );

      } catch (err) {

        setApiError(

          err.response?.data
            ?.message ||

          "Failed to save expense"
        );
      }
    };

  // ============================================
  // CONFIRM INHERITED INCOME
  // ============================================

  const confirmIncome =
    async () => {

      try {

        const expenseMonth =
          pendingExpense
            .expenseDate
            .slice(0, 7);

        // CREATE REAL INCOME
        await api.post(

          "/income-api/addIncome",

          {
            income:
              Number(
                editableIncome
              ),

            month:
              expenseMonth,
          }
        );

        // SAVE EXPENSE
        await saveExpenseToDB(
          pendingExpense
        );

        setShowIncomeConfirm(
          false
        );

      } catch (err) {

        setApiError(

          err.response?.data
            ?.message ||

          "Failed to confirm income"
        );
      }
    };

  return (
    <>
      <div className={modalOverlay}>

        <div className={modalCard}>

          {apiError && (
            <div
              className={`${errorClass} mb-4`}
            >
              {apiError}
            </div>
          )}

          <form
            noValidate
            onSubmit={handleSubmit(
              saveExpense
            )}
            className="space-y-4"
          >

            {/* AMOUNT */}
            <div>

              <label
                className={labelClass}
              >
                Amount
              </label>

              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter amount"
                className={inputClass}

                {...register(
                  "amount",

                  {
                    required:
                      "Amount is required",

                    validate:
                      (
                        value
                      ) => {

                        const trimmed =
                          value.trim();

                        if (
                          !/^[0-9]+$/.test(
                            trimmed
                          )
                        ) {

                          return "Amount must be greater than 0";
                        }

                        const parsed =
                          parseInt(
                            trimmed
                          );

                        if (
                          parsed <= 0
                        ) {

                          return "Amount should be more than 0";
                        }

                        if (
                          parsed >
                          MAX_EXPENSE
                        ) {

                          return "Expense exceeds maximum allowed limit";
                        }

                        return true;
                      },
                  }
                )}
              />

              {errors.amount && (

                <p
                  className={`${errorClass} mt-2`}
                >
                  {
                    errors.amount
                      .message
                  }
                </p>
              )}
            </div>

            {/* CATEGORY */}
            <div>

              <label
                className={labelClass}
              >
                Category
              </label>

              <select
                className={
                  selectClass
                }

                {...register(
                  "category",

                  {
                    required:
                      "Category is required",
                  }
                )}
              >

                <option value="">
                  Select Category
                </option>

                <option value="food">
                  Food
                </option>

                <option value="travel">
                  Travel
                </option>

                <option value="shopping">
                  Shopping
                </option>

                <option value="entertainment">
                  Entertainment
                </option>

                <option value="utilities">
                  Utilities
                </option>

                <option value="others">
                  Others
                </option>
              </select>

              {errors.category && (

                <p
                  className={`${errorClass} mt-2`}
                >
                  {
                    errors.category
                      .message
                  }
                </p>
              )}
            </div>

            {/* ITEM */}
            <div>

              <label
                className={labelClass}
              >
                Item Name
              </label>

              <input
                type="text"
                placeholder="Expense item"
                className={inputClass}

                {...register(
                  "item",

                  {
                    required:
                      "Item is required",

                    validate:
                      (
                        value
                      ) => {

                        if (
                          value.trim()
                            .length < 3
                        ) {

                          return "Item name must contain at least 3 characters";
                        }

                        return true;
                      },
                  }
                )}
              />

              {errors.item && (

                <p
                  className={`${errorClass} mt-2`}
                >
                  {
                    errors.item
                      .message
                  }
                </p>
              )}
            </div>

            {/* DATE */}
            <div>

              <label
                className={labelClass}
              >
                Date
              </label>

              <input
                type="date"
                className={inputClass}

                {...register(
                  "expenseDate",

                  {
                    required:
                      "Date is required",
                  }
                )}
              />

              {errors.expenseDate && (

                <p
                  className={`${errorClass} mt-2`}
                >
                  {
                    errors
                      .expenseDate
                      .message
                  }
                </p>
              )}
            </div>

            {/* BUTTONS */}
            <div
              className={
                modalActions
              }
            >

              <button
                type="submit"
                className={`${primaryBtn} flex-1`}
              >
                {isEditMode

                  ? "Update Expense"

                  : "Add Expense"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className={`${secondaryBtn} flex-1`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ========================================= */}
      {/* INHERITED INCOME MODAL */}
      {/* ========================================= */}

      {showIncomeConfirm && (

        <div className={modalOverlay}>

          <div className={modalCard}>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Confirm Income
            </h2>

            <p className="text-slate-500 mb-5">
              Inherited income found
              from previous month.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5">

              <p className="text-sm text-slate-500 mb-2">
                Income for month
              </p>

              <input
                type="number"
                value={
                  editableIncome
                }
                onChange={(
                  event
                ) =>
                  setEditableIncome(
                    event.target
                      .value
                  )
                }
                className={inputClass}
              />
            </div>

            <div className={modalActions}>

              <button
                onClick={
                  confirmIncome
                }
                className={`${primaryBtn} flex-1`}
              >
                Confirm Income
              </button>

              <button
                onClick={() =>
                  setShowIncomeConfirm(
                    false
                  )
                }
                className={`${secondaryBtn} flex-1`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function toDateInputValue(
  dateValue
) {

  const date =
    new Date(
      dateValue
    );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export default ExpenseFormModal;