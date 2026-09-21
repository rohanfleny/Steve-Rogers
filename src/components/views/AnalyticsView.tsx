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
      return 'bg-emerald-700';
    }

    if (completedCount >= 4) {
      return 'bg-emerald-500';
    }

    if (completedCount >= 2) {
      return 'bg-emerald-300';
    }

    if (completedCount === 1) {
      return 'bg-[#D6CEC0]';
    }

    return 'bg-[#E8E1D6]';
  };

  // ------------------------------------------------------------
  // CIRCULAR PERCENTAGE
  // ------------------------------------------------------------

  const getRingBackground = (
    percent: number
  ) => {
    if (percent <= 0) {
      return '#E5DDD0';
    }

    if (percent >= 100) {
      return '#059669';
    }

    return `conic-gradient(
      from 0deg,
      #059669 0% ${percent}%,
      #E5DDD0 ${percent}% 100%
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
        text-[#1C1917]
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
            border border-[#E5DDD0]
            rounded-2xl
            px-3
            py-2.5
            shadow-sm
          "
        >

          {/* Heading */}

          <div
            className="
              flex
              items-center
              justify-between
              mb-1.5
            "
          >
            <h2
              className="
                text-sm
                sm:text-base
                font-bold
                font-fancy
              "
            >
              Habit Completion
            </h2>

            <span
              className="
                text-[10px]
                sm:text-xs
                text-[#78716C]
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
                    text-[#78716C]
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
                      text-[#78716C]
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
                    border-[#E5DDD0]
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
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#F1ECE2] border border-[#DDD5C7]'
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
              border-[#E5DDD0]
            "
          >
            <div
              className="
                grid
                grid-cols-5
                gap-1
                w-full
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
                    justify-center
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
                      text-[#57534E]
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
            border border-[#E5DDD0]
            rounded-2xl
            px-3
            py-2.5
            shadow-sm
          "
        >

          {/* Heading */}

          <div
            className="
              flex
              items-center
              justify-between
              mb-1.5
            "
          >
            <h2
              className="
                text-sm
                sm:text-base
                font-bold
                font-fancy
              "
            >
              Last 30 Days
            </h2>

            <span
              className="
                text-[10px]
                sm:text-xs
                text-[#78716C]
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
              bg-[#F1ECE2]
              border
              border-[#DDD5C7]
              rounded-xl
            "
          >
            <div
              className="
                grid
                grid-cols-10
                gap-1.5
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
              text-[#78716C]
              font-mono
            "
          >
            <div className="flex items-center gap-1">
              <span
                className="
                  w-2.5
                  h-2.5
                  rounded-sm
                  bg-[#E8E1D6]
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
                  bg-[#D6CEC0]
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
                  bg-emerald-300
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
                  bg-emerald-500
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
                  bg-emerald-700
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
                border-[#E5DDD0]
                bg-[#F1ECE2]
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
                  text-emerald-700
                "
              >
                {fullDaysCount}
              </span>

              <span
                className="
                  block
                  text-[9px]
                  sm:text-[10px]
                  text-[#78716C]
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
                border-[#E5DDD0]
                bg-[#F1ECE2]
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
                  text-emerald-600
                "
              >
                {partialDaysCount}
              </span>

              <span
                className="
                  block
                  text-[9px]
                  sm:text-[10px]
                  text-[#78716C]
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
                border-[#E5DDD0]
                bg-[#F1ECE2]
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
                  text-[#78716C]
                "
              >
                {lowDaysCount}
              </span>

              <span
                className="
                  block
                  text-[9px]
                  sm:text-[10px]
                  text-[#78716C]
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
