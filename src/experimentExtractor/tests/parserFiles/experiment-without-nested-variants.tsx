import react from 'react'
import { Variant, Experiment } from '../../../abTestingInfra'

const TestComponent = () => (
  <div>
    <Experiment name='experiment' defaultVariantName='variantA'>      
      <div>
        <Variant name='variant'>Variant</Variant>
      </div>
    </Experiment>
  </div>
)

export default TestComponent