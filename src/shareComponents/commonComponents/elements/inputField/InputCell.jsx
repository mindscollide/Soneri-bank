import { memo } from "react";
import InputFIeld from "./InputField";

export const InputCell = memo(
  ({
    value,
    record,
    instrumentName,
    onInputChange,
    applyClass = "amountValue",
    ...inputProps
  }) => {
    const handleChange = (e) => {
      if (onInputChange) {
        onInputChange(record, `rate_${instrumentName}`, e.target.value);
      }
    };

    return (
      <InputFIeld
        value={value}
        onChange={handleChange}
        applyClass={applyClass}
        {...inputProps}
      />
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.value === nextProps.value &&
      prevProps.record.id === nextProps.record.id &&
      prevProps.instrumentName === nextProps.instrumentName
    );
  }
);
