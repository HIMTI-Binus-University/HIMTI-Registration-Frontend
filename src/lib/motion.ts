import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };

export const motionEase = "power3.out";
export const motionDuration = 0.24;
