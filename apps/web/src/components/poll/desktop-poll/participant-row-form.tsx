import { cn } from "@rallly/ui";
import { Button } from "@rallly/ui/button";
import { Icon } from "@rallly/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "@rallly/ui/tooltip";
import { UndoIcon } from "lucide-react";
import * as React from "react";
import { Controller } from "react-hook-form";

import { OptimizedAvatarImage } from "@/components/optimized-avatar-image";
import { Participant, ParticipantName } from "@/components/participant";
import { useVotingForm } from "@/components/poll/voting-form";
import { YouAvatar } from "@/components/poll/you-avatar";
import { Trans } from "@/components/trans";
import { useTranslation } from "@/i18n/client";

import { usePoll } from "../../poll-context";
import { toggleVote, VoteSelector } from "../vote-selector";

export interface ParticipantRowFormProps {
  name?: string;
  className?: string;
  isYou?: boolean;
  isNew?: boolean;
  onCancel?: () => void;
}

const ParticipantRowForm = ({
  name,
  isNew,
  className,
}: ParticipantRowFormProps) => {
  const { t } = useTranslation();

  const { optionIds } = usePoll();
  const form = useVotingForm();

  React.useEffect(() => {
    function cancel(e: KeyboardEvent) {
      if (e.key === "Escape") {
        form.cancel();
      }
    }
    window.addEventListener("keydown", cancel);
    return () => {
      window.removeEventListener("keydown", cancel);
    };
  }, [form]);

  const participantName = name ?? t("you");

  return (
    <tr className={cn("group", className)}>
      <td
        style={{ minWidth: 235, maxWidth: 235 }}
        className="sticky left-0 z-10 h-12 bg-white px-4"
      >
        <div className="flex items-center justify-between gap-x-2.5">
          <Participant>
            {name ? (
              <OptimizedAvatarImage name={participantName} size="sm" />
            ) : (
              <YouAvatar />
            )}
            <ParticipantName>{participantName}</ParticipantName>
          </Participant>
          {!isNew ? (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      form.cancel();
                    }}
                    size="sm"
                  >
                    <Icon>
                      <UndoIcon />
                    </Icon>
                  </Button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent>
                    <Trans i18nKey="cancel" />
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
              <Button
                variant="primary"
                loading={form.formState.isSubmitting}
                size="sm"
                form="voting-form"
                type="submit"
              >
                <Trans i18nKey="save" />
              </Button>
            </div>
          ) : null}
        </div>
      </td>
      {optionIds.map((optionId, i) => {
        return (
          <td
            key={optionId}
            className="relative h-12 border-t border-l bg-gray-50"
          >
            <Controller
              control={form.control}
              name={`votes.${i}`}
              render={({ field }) => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: Fix later
                // biome-ignore lint/a11y/noStaticElementInteractions: Fix later
                <div
                  onClick={() => {
                    field.onChange({
                      optionId,
                      type: toggleVote(field.value?.type),
                    });
                  }}
                  className="absolute inset-0 flex cursor-pointer items-center justify-center hover:bg-gray-100 active:bg-gray-200/50 active:ring-1 active:ring-gray-200 active:ring-inset"
                >
                  <VoteSelector
                    value={field.value?.type}
                    onChange={(vote) => {
                      field.onChange({ optionId, type: vote });
                    }}
                  />
                </div>
              )}
            />
          </td>
        );
      })}
      <td className="border-l bg-diagonal-lines" />
    </tr>
  );
};

export default ParticipantRowForm;
