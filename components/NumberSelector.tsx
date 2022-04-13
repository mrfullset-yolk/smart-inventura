import React, { BaseSyntheticEvent } from "react";
import { Button, Form } from "react-bootstrap";
import styles from "./NumberSelector.module.scss";

const NumberSelector = ({ value, onChange }: NumberSelectorProps) => {
  return (
    <div className={styles["number-selector"]}>
      <Button
        className={styles.control}
        onClick={() => {
          onChange(value - 1);
        }}
      >
        -
      </Button>
      <Form.Control
        type="number"
        placeholder=""
        className={styles.input}
        value={value}
        onChange={(e) => {
          onChange(Number.parseInt(e.target.value));
        }}
      />
      <Button
        className={styles.control}
        onClick={() => {
          onChange(value + 1);
        }}
      >
        +
      </Button>
    </div>
  );
};

export default NumberSelector;

type NumberSelectorProps = {
  value: number;
  onChange: (value: number) => void;
};
