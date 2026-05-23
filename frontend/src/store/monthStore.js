import { create }
from "zustand";

const getCurrentDate =
  () => {

    return new Date()
      .toISOString()
      .split("T")[0];
  };

export const useMonthStore =
  create((set) => ({

    selectedDate:
      localStorage.getItem(
        "selectedDate"
      ) ||

      getCurrentDate(),

    setSelectedDate:
      (date) => {

        localStorage.setItem(
          "selectedDate",
          date
        );

        set({
          selectedDate:
            date,
        });
      },

    resetToCurrentMonth:
      () => {

        const currentDate =
          getCurrentDate();

        localStorage.setItem(
          "selectedDate",
          currentDate
        );

        set({
          selectedDate:
            currentDate,
        });
      },
  }));