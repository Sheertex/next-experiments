import react from 'react'
import { Variant, Experiment } from '../../../abTestingInfra'

const TestComponent = () => (
  <div>
    <Experiment name='experiment' defaultVariantName='variantA'>      
    </Experiment>
  </div>
)

export default TestComponent