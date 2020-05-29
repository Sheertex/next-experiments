import react from 'react'
import { Variant, Experiment } from '../../../abTestingInfra'

const TestComponent = () => (
  <div>
    <Experiment defaultVariantName='variantA'>
      <Variant name="variant">Variant</Variant>
    </Experiment>
  </div>
)

export default TestComponent