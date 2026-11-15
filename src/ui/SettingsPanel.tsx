import { useState } from "react";
import type { ReadingLevel, Settings } from "../game/types";
import { Modal } from "./Modal";

interface SettingsPanelProps {
  settings: Settings;
  readAloudSupported: boolean;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
  onRestart: () => void;
}

export function SettingsPanel({
  settings,
  readAloudSupported,
  onChange,
  onClose,
  onRestart,
}: SettingsPanelProps) {
  const [confirming, setConfirming] = useState(false);

  const readingOption = (level: ReadingLevel, title: string, detail: string) => (
    <label className={`option${settings.reading === level ? " option--on" : ""}`}>
      <input
        type="radio"
        name="reading-level"
        checked={settings.reading === level}
        onChange={() => onChange({ reading: level })}
      />
      <span>
        <strong>{title}</strong>
        <em>{detail}</em>
      </span>
    </label>
  );

  return (
    <Modal id="settings" title="Settings" onClose={onClose}>
      <fieldset className="option-group">
        <legend>Reading support</legend>
        {readingOption("little", "Bigger, simpler words", "Short sentences and one idea at a time.")}
        {readingOption("mission", "More detail", "Extra explanations you can open when you want them.")}
      </fieldset>

      <fieldset className="option-group">
        <legend>Comfort</legend>
        <label className="checkline">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(event) => onChange({ reducedMotion: event.target.checked })}
          />
          <span>
            Reduced motion
            <em>Turns off the fan spin, rover drive, twinkling stars and fades.</em>
          </span>
        </label>
        <label className="checkline">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(event) => onChange({ sound: event.target.checked })}
          />
          <span>
            Sound effects
            <em>Quiet blips for taps and results. Start muted, always.</em>
          </span>
        </label>
        <label className="checkline">
          <input
            type="checkbox"
            checked={settings.readAloud}
            disabled={!readAloudSupported}
            onChange={(event) => onChange({ readAloud: event.target.checked })}
          />
          <span>
            Read aloud button
            <em>
              {readAloudSupported
                ? "Adds a Read button to mission cards. Sound is never needed to understand the game."
                : "This browser does not offer read-aloud. The game works fully without it."}
            </em>
          </span>
        </label>
      </fieldset>

      <section className="save-note">
        <h3>Your mission is saved on this device</h3>
        <p>
          Red Dust keeps your mission in this browser only. There is no account,
          no advertising, no leaderboard and no game analytics. The hosting
          provider may record anonymous page views. Restarting clears this
          mission from the device.
        </p>
        {confirming ? (
          <div className="confirm-row">
            <p>Restart the mission from day 1?</p>
            <button
              type="button"
              className="btn btn--secondary btn--small"
              onClick={() => {
                onRestart();
                setConfirming(false);
                onClose();
              }}
            >
              Yes, restart
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => setConfirming(false)}
            >
              Keep playing
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => setConfirming(true)}
          >
            Restart mission
          </button>
        )}
      </section>
    </Modal>
  );
}
