import { useState } from "react";
import { BUSINESS_TYPES } from "../data/businessTypes";
import { CraftIcon, CheckIcon } from "./icons";

export default function Onboarding({ onComplete, initialId }) {
  const [selected, setSelected] = useState(initialId || null);

  return (
    <div className="onboarding">
      <div className="onboarding-mark">✦</div>
      <h1 className="onboarding-heading">What does your business make?</h1>
      <p className="onboarding-sub">
        Growly tailors your products, stock and dashboard to match. You can
        switch this anytime from the menu.
      </p>

      <div className="craft-grid">
        {BUSINESS_TYPES.map((type) => {
          const isSelected = selected === type.id;
          return (
            <button
              key={type.id}
              type="button"
              className={`craft-card${isSelected ? " is-selected" : ""}`}
              onClick={() => setSelected(type.id)}
              aria-pressed={isSelected}
            >
              <span className="craft-icon">
                {isSelected ? <CheckIcon /> : <CraftIcon icon={type.icon} />}
              </span>
              <div className="craft-name">{type.name}</div>
              <div className="craft-desc">{type.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="onboarding-foot">
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!selected}
          onClick={() => selected && onComplete(selected)}
        >
          Set up my dashboard
        </button>
      </div>
    </div>
  );
}
