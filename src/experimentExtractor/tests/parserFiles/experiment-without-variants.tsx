import React from 'react'
import { Variant, Experiment } from '../../../abTestingInfra'

const TestComponent = () => (
  <div>
    <Experiment name='experiment' defaultVariantName='variantA' />      
  </div>
)

export default TestComponent