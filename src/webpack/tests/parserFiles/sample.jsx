import React from 'react'
import { Variant, Experiment } from '../../../index';

const TestComponent = () => (
  <Experiment name='experiment' defaultVariantName='variantA'>
    <Variant name="variantA">A</Variant>
    <Variant name="variantB">B</Variant>
  </Experiment>
)

export default TestComponent