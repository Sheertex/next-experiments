import react from 'react'
import { Variant, Experiment } from '../../../abTestingInfra'

const TestComponent = () => (
  <Experiment name='experiment' defaultVariantName='variantA'>
    <Variant name="variantA">A</Variant>
    <Variant name="variantB">B</Variant>
  </Experiment>
)

export default TestComponent