import react from 'react'
import { Variant, Experiment } from '../../../abTestingInfra'

const TestComponent = () => (
  <div>
  <div id='componentA'>
    <Experiment name='experiment' defaultVariantName='variantA'>
      <Variant name="variantA">A</Variant>
      <Variant name="variantB">B</Variant>
    </Experiment>
  </div>
  <div id='componentB'>
    <Experiment name='experiment' defaultVariantName='variantD'>
      <Variant name="variantD">D</Variant>
      <Variant name="variantC">C</Variant>
    </Experiment>
  </div>
  </div>
)

export default TestComponent