// Dummy registry to prevent compilation errors before running build
import { registerBones } from 'boneyard-js/react';
try {
  registerBones({});
} catch (e) {}
