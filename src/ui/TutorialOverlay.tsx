import { useState } from "react";
import type { ActivityId, ReadingLevel } from "../game/types";
import { pick } from "../game/copy";
import { AirIcon, BatteryIcon, LeafIcon, ShieldIcon } from "./icons";
import { Modal } from "./Modal";

interface TutorialOverlayProps {
  reading: ReadingLevel;
  onApplyPlan: (plan: ActivityId[]) => void;
  onFinish: () => void;
  onSkip: () => void;
}

const STEPS = 4;

export function TutorialOverlay({
  reading,
  onApplyPlan,
  onFinish,
  onSkip,
}: TutorialOverlayProps) {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step >= STEPS - 1) onFinish();
    else setStep(step + 1);
  };

  const content = [
    {
      title: "Meet the outpost",
      icon: <BatteryIcon width={28} height={28} />,
      kid: "This is your Mars base. Every day you get power units and two crew jobs.",
      full: "Jezero Outpost runs on solar power and two crew task cards each day (one Mars day). Every job spends from those same supplies.",
      action: null,
    },
    {
      title: "Make some air",
      icon: <AirIcon width={28} height={28} />,
      kid: "The crew breathes air. Put two power in the oxygen plant.",
      full: "The oxygen plant splits carbon dioxide from the thin Mars air, like NASA's MOXIE experiment. It costs two power, adds three air, and no crew task.",
      action: { label: "Show me", plan: ["oxygen"] as ActivityId[] },
    },
    {
      title: "Watch the dose",
      icon: <ShieldIcon width={28} height={28} />,
      kid: "Space radiation adds up every day. A storm adds a lot. Shelter or build the soil berm.",
      full: "Background radiation is about 0.64 mSv a day, measured by NASA's RAD. A solar storm adds about 2 mSv unless the crew shelters, and the soil berm lowers every day after it is built.",
      action: { label: "Add the berm", plan: ["oxygen", "shield"] as ActivityId[] },
      action2: {
        label: "Prepare the shelter",
        plan: ["oxygen", "shelter"] as ActivityId[],
      },
    },
    {
      title: "Look, then run",
      icon: <LeafIcon width={28} height={28} />,
      kid: "The plan shows what will happen. Then press Run This Day.",
      full: "The preview and the day use the same rules, so nothing is a surprise. Undo is always there before you run.",
      action: null,
    },
  ][step];

  return (
    <Modal
      id="tutorial"
      title={`How to play · ${step + 1} of ${STEPS}`}
      onClose={onSkip}
      closeLabel="Skip"
      footer={
        <div className="tutorial-foot">
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            Back
          </button>
          <button type="button" className="btn btn--primary" onClick={next}>
            {step === STEPS - 1 ? "Let's play" : "Next"}
          </button>
        </div>
      }
    >
      <div className="tutorial">
        <div className="tutorial-progress" aria-hidden="true">
          {Array.from({ length: STEPS }, (_, index) => (
            <span
              key={index}
              className={`tutorial-dot${index <= step ? " tutorial-dot--on" : ""}`}
            />
          ))}
        </div>
        <div className="tutorial-illustration" aria-hidden="true">
          {content.icon}
        </div>
        <h3>{content.title}</h3>
        <p className="tutorial-text">{pick(reading, content.kid, content.full)}</p>

        {content.action ? (
          <div className="tutorial-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                onApplyPlan(content.action!.plan);
                next();
              }}
            >
              {content.action.label}
            </button>
            {step === 2 && "action2" in content && content.action2 ? (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  onApplyPlan(content.action2!.plan);
                  next();
                }}
              >
                {content.action2.label}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
