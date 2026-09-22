import React from 'react';
import {
  DailyRecord,
  DAILY_GOALS_DEFINITION,
  DailyGoalId,
  UserSettings,
  getGoalTitle,
} from '../../types/daily';
import {
  shiftDate,
  calculateDailyProgress,
  getTodayDateString,
} from '../../logic/calculations';

interface AnalyticsViewProps {
  allRecords: Record<string, DailyRecord>;
  selectedDate: string;
  settings: UserSettings;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  allRecords,
  selectedDate,
  settings,
}) => {
  const today = getTodayDateString();

  const weekDays = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];

  // ------------------------------------------------------------
  // CURRENT WEEK
  // ------------------------------------------------------------

  const [y, m, d] = selectedDate.split('-').map(Number);

  const currentDateObj = new Date(y, m - 1, d);

  const dayOfWeek = currentDateObj.getDay();

  const diffToMonday =
    dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const mondayDateStr = shiftDate(
    selectedDate,
    diffToMonday
  );

  const weekDates = weekDays.map((label, index) => ({
    label,
    dateStr: shiftDate(mondayDateStr, index),
  }));

  // ------------------------------------------------------------
  // DYNAMIC GOAL NAMES
  // ------------------------------------------------------------

  const habitRows: {
    id: DailyGoalId;
    label: string;
  }[] = DAILY_GOALS_DEFINITION.map((goal) => ({
    id: goal.id,
    label: getGoalTitle(goal.id, settings),
  }));

  // ------------------------------------------------------------
  // WEEKLY HABIT STATS
  // ------------------------------------------------------------

  const habitStats = habitRows.map((habit) => {
    let completedCount = 0;

    weekDates.forEach((day) => {
      const record = allRecords[day.dateStr];

      if (record?.goals?.[habit.id] === true) {
        completedCount++;
      }
    });

    const percent = Math.round(
      (completedCount / 7) * 100
    );

    return {
      ...habit,
      completedCount,
      percent,
    };
  });

  // ------------------------------------------------------------
  // LAST 30 DAYS
  // ------------------------------------------------------------

  const last30Days = Array.from(
    { length: 30 },
    (_, index) => {
      const dateStr = shiftDate(
        today,
        -(29 - index)
      );

      const record = allRecords[dateStr];

      const { completedCount } =
        calculateDailyProgress(record?.goals);

      return {
        dateStr,
        completedCount,
      };
    }
  );

  const fullDaysCount = last30Days.filter(
    (day) => day.completedCount >= 4
  ).length;

  const partialDaysCount = last30Days.filter(
    (day) =>
      day.completedCount >= 2 &&
      day.completedCount <= 3
  ).length;

  const lowDaysCount = last30Days.filter(
    (day) => day.completedCount <= 1
  ).length;

  // ------------------------------------------------------------
  // HEATMAP COLOR
  // ------------------------------------------------------------

  const getHeatmapClass = (
    completedCount: number
  ) => {
    if (completedCount >= 5) {
      return 'bg-[#9B1B30]';
    }

    if (completedCount >= 4) {
      return 'bg-[#9B1B30]';
    }

    if (completedCount >= 2) {
      return 'bg-[#E4B9C0]';
    }

    if (completedCount === 1) {
      return 'bg-[#D6DCE8]';
    }

    return 'bg-[#EEF2F6]';
  };

  // ------------------------------------------------------------
  // CIRCULAR PERCENTAGE
  // ------------------------------------------------------------

  const getRingBackground = (
    percent: number
  ) => {
    if (percent <= 0) {
      return '#D6DCE8';
    }

    if (percent >= 100) {
      return '#9B1B30';
    }

    return `conic-gradient(
      from 0deg,
      #9B1B30 0% ${percent}%,
      #D6DCE8 ${percent}% 100%
    )`;
  };

  return (
    <div
      id="analytics-view"
      className="
        h-full
        min-h-0
        flex
        flex-col
        font-handwriting
        text-[#1B3A57]
      "
    >
      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          space-y-2
          pb-1
        "
      >

        {/* =====================================================
            HABIT COMPLETION
            ===================================================== */}

        <section
          className="
            bg-[#FAF7F0]
            border border-[#D6DCE8]
            rounded-2xl
            shadow-sm
            text-[#9B1B30]
            overflow-hidden
          "
        >

          {/* Heading */}

          <div
            className="
              bg-[#1B3A57]
              px-3
              py-2.5
              -mx-0
              flex
              items-center
              justify-between
            "
          >
            <h2
              className="
                text-sm
                sm:text-base
                font-bold
                font-fancy
                text-[#FAF7F0]
              "
            >
              Habit Completion
            </h2>

            <span
              className="
                text-[10px]
                sm:text-xs
                text-[#FAF7F0]
                font-mono
              "
            >
              Mon – Sun
            </span>
          </div>

          {/* =================================================
              WEEK TABLE
              IMPORTANT:
              NO HORIZONTAL SCROLL
              ================================================= */}

          <table
            className="
              w-full
              table-fixed
              border-collapse
            "
          >
            <thead>
              <tr>
                <th
                  className="
                    w-[27%]
                    pb-1
                    pr-1
                    text-left
                    text-[10px]
                    sm:text-xs
                    text-[#9B1B30]
                    font-normal
                  "
                >
                  Habit
                </th>

                {weekDates.map((day) => (
                  <th
                    key={day.dateStr}
                    className="
                      pb-1
                      text-center
                      text-[9px]
                      sm:text-[10px]
                      text-[#9B1B30]
                      font-semibold
                      font-mono
                    "
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {habitRows.map((habit) => (
                <tr
                  key={habit.id}
                  className="
                    border-t
                    border-[#D6DCE8]
                  "
                >

                  {/* Habit name */}

                  <td
                    className="
                      py-1
                      pr-1
                      text-[10px]
                      sm:text-xs
                      font-bold
                      leading-tight
                      break-words
                    "
                  >
                    {habit.label}
                  </td>

                  {/* Days */}

                  {weekDates.map((day) => {
                    const isCompleted =
                      allRecords[
                        day.dateStr
                      ]?.goals?.[habit.id] === true;

                    return (
                      <td
                        key={day.dateStr}
                        className="
                          py-1
                          text-center
                        "
                      >
                        <div
                          title={`${habit.label}: ${
                            isCompleted
                              ? 'Done'
                              : 'Missed'
                          } on ${day.label}`}
                          className={`
                            w-4
                            h-4
                            sm:w-5
                            sm:h-5
                            rounded-[5px]
                            mx-auto
                            flex
                            items-center
                            justify-center
                            ${
                              isCompleted
                                ? 'bg-[#9B1B30] text-white'
                                : 'bg-[#EEF2F6] border border-[#D6DCE8]'
                            }
                          `}
                        >
                          {isCompleted && (
                            <span
                              className="
                                text-[8px]
                                sm:text-[9px]
                                font-bold
                              "
                            >
                              ✓
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* =================================================
              CIRCULAR PERCENTAGES

              Outer boxes removed to save space.
              ================================================= */}

          <div
            className="
              mt-2
              pt-2
              border-t
              border-[#D6DCE8]
            "
          >
            <div
              className="
                grid
                grid-cols-5
                gap-1
                w-full
                items-start
              "
            >
              {habitStats.map((stat) => (
                <div
                  key={stat.id}
                  className="
                    min-w-0
                    flex
                    flex-col
                    items-center
                    justify-start
                    text-center
                    min-h-[72px]
                  "
                >

                  {/* Circle */}

                  <div
                    className="
                      w-10
                      h-10
                      sm:w-11
                      sm:h-11
                      rounded-full
                      flex
                      items-center
                      justify-center
                    "
                    style={{
                      background:
                        getRingBackground(
                          stat.percent
                        ),
                    }}
                  >
                    <div
                      className="
                        w-8
                        h-8
                        sm:w-9
                        sm:h-9
                        rounded-full
                        bg-[#FAF7F0]
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <span
                        className="
                          text-[9px]
                          sm:text-[10px]
                          font-bold
                          font-mono
                          text-[#9B1B30]
                        "
                      >
                        {stat.percent}%
                      </span>
                    </div>
                  </div>

                  {/* Goal name */}

                  <span
                    className="
                      mt-1
                      text-[9px]
                      sm:text-[10px]
                      font-semibold
                      text-[#9B1B30]
                      leading-tight
                      text-center
                      break-words
                      max-w-full
                    "
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            LAST 30 DAYS
            ===================================================== */}

        <section
          className="
            bg-[#FAF7F0]
            border border-[#D6DCE8]
            rounded-2xl
            shadow-sm
            text-[#9B1B30]
            overflow-hidden
          "
        >

          {/* Heading */}

          <div
            className="
              bg-[#1B3A57]
              px-3
              py-2.5
              flex
              items-center
              justify-between
            "
          >
            <h2
              className="
                text-sm
                sm:text-base
                font-bold
                font-fancy
                text-[#FAF7F0]
              "
            >
              Last 30 Days
            </h2>

            <span
              className="
                text-[10px]
                sm:text-xs
                text-[#FAF7F0]
                font-mono
              "
            >
              30 days
            </span>
          </div>

          {/* =================================================
              HEATMAP
              ================================================= */}

          <div
            className="
              p-2
              bg-[#FAF7F0]
              border
              border-[#D6DCE8]
              rounded-xl
            "
          >
            <div
              className="
                grid
                grid-cols-10
                gap-1.5
                w-full
              "
            >
              {last30Days.map((day) => (
                <div
                  key={day.dateStr}
                  title={`${day.dateStr}: ${day.completedCount}/5 completed`}
                  className={`
                    w-full
                    aspect-square
                    rounded-[4px]
                    ${getHeatmapClass(
                      day.completedCount
                    )}
                  `}
                />
              ))}
            </div>
          </div>

          {/* =================================================
              LEGEND
              ================================================= */}

          <div
            className="
              flex
              items-center
              justify-center
              gap-2.5
              mt-1.5
              text-[9px]
              sm:text-[10px]
              text-[#9B1B30]
              font-mono
            "
          >
            <div className="flex items-center gap-1">
              <span
                className="
                  w-2.5
                  h-2.5
                  rounded-sm
                  bg-[#EEF2F6]
                "
              />
              0
            </div>

            <div className="flex items-center gap-1">
              <span
                className="
                  w-2.5
                  h-2.5
                  rounded-sm
                  bg-[#D6DCE8]
                "
              />
              1
            </div>

            <div className="flex items-center gap-1">
              <span
                className="
                  w-2.5
                  h-2.5
                  rounded-sm
                  bg-[#E4B9C0]
                "
              />
              2–3
            </div>

            <div className="flex items-center gap-1">
              <span
                className="
                  w-2.5
                  h-2.5
                  rounded-sm
                  bg-[#9B1B30]
                "
              />
              4
            </div>

            <div className="flex items-center gap-1">
              <span
                className="
                  w-2.5
                  h-2.5
                  rounded-sm
                  bg-[#9B1B30]
                "
              />
              5
            </div>
          </div>

          {/* =================================================
              30-DAY STATISTICS
              ================================================= */}

          <div
            className="
              grid
              grid-cols-3
              gap-1.5
              mt-1.5
            "
          >

            <div
              className="
                rounded-xl
                border
                border-[#9B1B30]
                bg-[#9B1B30]
                py-1.5
                px-1
                text-center
              "
            >
              <span
                className="
                  block
                  text-lg
                  sm:text-xl
                  font-bold
                  font-mono
                  text-[#FAF7F0]
                "
              >
                {fullDaysCount}
              </span>

              <span
                className="
                  block
                  text-[9px]
                  sm:text-[10px]
                  text-[#FAF7F0]
                  leading-tight
                "
              >
                Full days
              </span>
            </div>

            <div
              className="
                rounded-xl
                border
                border-[#9B1B30]
                bg-[#9B1B30]
                py-1.5
                px-1
                text-center
              "
            >
              <span
                className="
                  block
                  text-lg
                  sm:text-xl
                  font-bold
                  font-mono
                  text-[#FAF7F0]
                "
              >
                {partialDaysCount}
              </span>

              <span
                className="
                  block
                  text-[9px]
                  sm:text-[10px]
                  text-[#FAF7F0]
                  leading-tight
                "
              >
                Partial days
              </span>
            </div>

            <div
              className="
                rounded-xl
                border
                border-[#9B1B30]
                bg-[#9B1B30]
                py-1.5
                px-1
                text-center
              "
            >
              <span
                className="
                  block
                  text-lg
                  sm:text-xl
                  font-bold
                  font-mono
                  text-[#FAF7F0]
                "
              >
                {lowDaysCount}
              </span>

              <span
                className="
                  block
                  text-[9px]
                  sm:text-[10px]
                  text-[#FAF7F0]
                  leading-tight
                "
              >
                Low days
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
