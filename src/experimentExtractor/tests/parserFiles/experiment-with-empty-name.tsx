import react from 'react'
import { Variant, Experiment } from '../../../abTestingInfra'

const TestComponent = () => (
  <div>
    <Experiment name='' defaultVariantName='variantA'>
      <Variant name="variant">Variant</Variant>
    </Experiment>
  </div>
)

export default TestComponent