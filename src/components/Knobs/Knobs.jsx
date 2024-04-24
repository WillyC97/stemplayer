import {KnobBase} from './KnobBase';

const stepFn = () => 0.01;
const stepLargerFn = () => 0.1;

export const PanKnob = ({ min = -1, max = 1, ...props }) => {
    const valueRawDisplayFn = (valueRaw) => `${valueRaw}`;

  return (
    <KnobBase
      stepFn={stepFn}
      stepLargerFn={stepLargerFn}
      valueRawRoundFn={() => {}}
      valueRawDisplayFn={valueRawDisplayFn}
      valueMin={min} 
      valueMax={max}
      {...props}
    />
  );
}

