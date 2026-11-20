import {useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {Fog} from 'three';
import {useGame} from './store';
import {normalizeBrightness} from './visibility';
export default function SceneExposure(){const {gl,scene}=useThree(),brightness=normalizeBrightness(useGame(s=>s.settings.brightness));useEffect(()=>{gl.toneMappingExposure=brightness;gl.domElement.dataset.brightness=String(Math.round(brightness*100));gl.domElement.dataset.exposure=String(gl.toneMappingExposure);if(scene.fog instanceof Fog){gl.domElement.dataset.fogNear=String(scene.fog.near);gl.domElement.dataset.fogFar=String(scene.fog.far)}},[gl,scene,brightness]);return null}
