import "react-big-calendar/lib/css/react-big-calendar.css";
import "./rbc-overrides.css";

import dayjs from "dayjs";
import { XIcon } from "lucide-react";
import type React from "react";
import type { CalendarProps } from "react-big-calendar";
import { Calendar } from "react-big-calendar";
import { createBreakpoint } from "react-use";

import { getDuration } from "../../../utils/date-time-utils";
import DateNavigationToolbar from "./date-navigation-toolbar";
import dayjsLocalizer from "./dayjs-localizer";
import type { DateTimeOption, DateTimePickerProps } from "./types";
import { formatDateWithoutTz } from "./utils";

const localizer = dayjsLocalizer(dayjs);

const useDevice = createBreakpoint({ desktop: 720, mobile: 360 });

/**
 * Not sure what's wrong with the type definitions for react-big-calendar but it's not working properly.
 * This is a temporary fix that overrides their types which ideally we wouldn't have to do.
 */
const CalendarTempFix = Calendar as React.ComponentType<CalendarProps>;

const WeekCalendar: React.FunctionComponent<DateTimePickerProps> = ({
  options,
  onNavigate,
  date,
  onChange,
  duration = 60,
  onChangeDuration,
}) => {
  const scrollToTime =
    options.length > 0
      ? options[0].type === "timeSlot"
        ? new Date(options[0].start)
        : undefined
      : undefined;

  const defaultView = useDevice() === "mobile" ? "day" : "week";

  return (
    <div className="relative flex h-[600px]">
      <CalendarTempFix
        className="absolute inset-0"
        events={options.map((option) => {
          if (option.type === "date") {
            return { start: new Date(option.date) };
          } else {
            return {
              start: new Date(option.start),
              end: new Date(option.end),
            };
          }
        })}
        culture="default"
        onNavigate={onNavigate}
        date={date}
        defaultView={defaultView}
        views={["week", "day"]}
        selectable={true}
        localizer={localizer}
        onSelectEvent={(event) => {
          onChange(
            options.filter(
              (option) =>
                !(
                  option.type === "timeSlot" &&
                  event.start &&
                  option.start === formatDateWithoutTz(event.start) &&
                  event.end &&
                  option.end === formatDateWithoutTz(event.end)
                ),
            ),
          );
        }}
        components={{
          toolbar: function Toolbar(props) {
            return (
              <DateNavigationToolbar
                year={props.date.getFullYear()}
                label={props.label}
                onPrevious={() => {
                  props.onNavigate("PREV");
                }}
                onToday={() => {
                  props.onNavigate("TODAY");
                }}
                onNext={() => {
                  props.onNavigate("NEXT");
                }}
              />
            );
          },
          eventWrapper: function EventWraper(props) {
            const start = dayjs(props.event.start);
            const end = dayjs(props.event.end);
            return (
              // biome-ignore lint/a11y/noStaticElementInteractions: fix later
              <div
                // onClick prop doesn't work properly. Seems like some other element is cancelling the event before it reaches this element
                onMouseUp={props.onClick}
                className="group absolute ml-1 flex max-h-full flex-col justify-between overflow-hidden rounded-lg border border-primary-300 border-dashed bg-white/50 p-1 text-primary-500 text-xs shadow-sm hover:cursor-pointer hover:border-primary-400 hover:text-primary-600"
                style={{
                  top: `calc(${props.style?.top}% + 4px)`,
                  height: `calc(${props.style?.height}% - 8px)`,
                  left: `${props.style?.xOffset}%`,
                  width: `calc(${props.style?.width}%)`,
                }}
              >
                <div className="absolute top-1.5 right-1.5 flex justify-end opacity-0 group-hover:opacity-100">
                  <XIcon className="size-3" />
                </div>
                <div>
                  <div className="font-semibold">{start.format("LT")}</div>
                  <div className="opacity-50">{getDuration(start, end)}</div>
                </div>
                <div>
                  <div className="opacity-50">{end.format("LT")}</div>
                </div>
              </div>
            );
          },
          week: {
            // biome-ignore lint/suspicious/noExplicitAny: Fix this later
            header: function Header({ date }: any) {
              return (
                <span className="w-full rounded-md text-center text-sm tracking-tight">
                  <span className="mr-1.5 font-normal opacity-50">
                    {dayjs(date).format("ddd")}
                  </span>
                  <span className="font-medium">
                    {dayjs(date).format("DD")}
                  </span>
                </span>
              );
            },
          },
          timeSlotWrapper: function TimeSlotWrapper({
            children,
          }: {
            children?: React.ReactNode;
          }) {
            return (
              <div className="h-6 text-gray-500 text-xs leading-none">
                {children}
              </div>
            );
          },
        }}
        step={15}
        onSelectSlot={({ start, end, action }) => {
          // on select slot
          const startDate = new Date(start);
          const endDate = new Date(end);

          const newEvent: DateTimeOption = {
            type: "timeSlot",
            start: formatDateWithoutTz(startDate),
            duration: dayjs(endDate).diff(endDate, "minutes"),
            end: formatDateWithoutTz(endDate),
          };

          if (action === "select") {
            const diff = dayjs(endDate).diff(startDate, "minutes");
            if (diff < 60 * 24) {
              onChangeDuration(diff);
            }
          } else {
            newEvent.end = formatDateWithoutTz(
              dayjs(startDate).add(duration, "minutes").toDate(),
            );
          }

          const alreadyExists = options.some(
            (option) =>
              option.type === "timeSlot" &&
              option.start === newEvent.start &&
              option.end === newEvent.end,
          );

          if (!alreadyExists) {
            onChange([...options, newEvent]);
          }
        }}
        scrollToTime={scrollToTime}
      />
    </div>
  );
};

export default WeekCalendar;
