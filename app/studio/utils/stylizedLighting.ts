"use client";

import * as THREE from "three";

export type LightingPreset =
  | "dawn"
  | "golden"
  | "morning"
  | "noon"
  | "evening"
  | "dusk"
  | "night";

export type StylizedLightState = {
  position?: [number, number, number];
  target?: [number, number, number];
  intensity: number;
  color: string;
  shadowStrength: number;
};

type LightingPalette = {
  sunColor: string;
  ambientColor: string;
  fillColor: string;
  rimColor: string;
  sunIntensity: number;
  fillIntensity: number;
  rimIntensity: number;
  ambientIntensity: number;
};

type SolarReferenceState = {
  elevationDeg: number;
  azimuthDeg: number;
  daylightFactor: number;
  directSunFactor: number;
  twilightFactor: number;
  nightFactor: number;
  sunKelvin: number;
};

export const STYLIZED_TIME_RANGE = 100;

const CYCLE_START_MINUTES = 5 * 60;
const CYCLE_END_MINUTES = 19 * 60;
const CYCLE_DURATION_MINUTES = CYCLE_END_MINUTES - CYCLE_START_MINUTES;
const REFERENCE_SOLAR_DAY_OF_YEAR = 80;
const REFERENCE_SOLAR_LATITUDE_DEG = 35;
const REFERENCE_SOLAR_LONGITUDE_DEG = 0;
const REFERENCE_SOLAR_TIMEZONE_HOURS = 0;
const CIE_ILLUMINANT_A_KELVIN = 2856;
const CIE_D50_KELVIN = 5000;
const CIE_D65_KELVIN = 6500;

function clockMinutesToStylizedTime(totalMinutes: number) {
  return (
    ((THREE.MathUtils.clamp(totalMinutes, CYCLE_START_MINUTES, CYCLE_END_MINUTES) -
      CYCLE_START_MINUTES) /
      CYCLE_DURATION_MINUTES) *
    STYLIZED_TIME_RANGE
  );
}

function getLightingClockMinutes(currentTime: number) {
  return Math.round(
    CYCLE_START_MINUTES +
      getLightingCycleProgress(currentTime) * CYCLE_DURATION_MINUTES,
  );
}

export const STYLIZED_LIGHTING_PRESET_OPTIONS: Array<{
  value: LightingPreset;
  label: string;
  time: number;
}> = [
  { value: "dawn", label: "Dawn", time: clockMinutesToStylizedTime(5 * 60 + 45) },
  { value: "golden", label: "Golden", time: clockMinutesToStylizedTime(6 * 60 + 30) },
  { value: "morning", label: "Morning", time: clockMinutesToStylizedTime(8 * 60) },
  { value: "noon", label: "Noon", time: clockMinutesToStylizedTime(12 * 60) },
  { value: "evening", label: "Evening", time: clockMinutesToStylizedTime(14 * 60) },
  { value: "dusk", label: "Dusk", time: clockMinutesToStylizedTime(18 * 60 + 30) },
  { value: "night", label: "Night", time: clockMinutesToStylizedTime(5 * 60) },
];

const SLIDER_COLOR_STOPS = [
  { time: 0, color: "#20285a" },
  { time: 12, color: "#38458a" },
  { time: 28, color: "#8dbde8" },
  { time: 46, color: "#ecd899" },
  { time: 66, color: "#ffaf52" },
  { time: 84, color: "#d86449" },
  { time: 100, color: "#1f2145" },
] as const;

function getSliderColorAtTime(currentTime: number) {
  const safeTime = clampStylizedLightingTime(currentTime);

  for (let index = 0; index < SLIDER_COLOR_STOPS.length - 1; index += 1) {
    const current = SLIDER_COLOR_STOPS[index];
    const next = SLIDER_COLOR_STOPS[index + 1];

    if (safeTime >= current.time && safeTime <= next.time) {
      const progress = (safeTime - current.time) / (next.time - current.time);
      return new THREE.Color(current.color).lerp(new THREE.Color(next.color), progress);
    }
  }

  return new THREE.Color(SLIDER_COLOR_STOPS[SLIDER_COLOR_STOPS.length - 1].color);
}

export const STYLIZED_LIGHTING_PRESET_COLORS: Record<
  LightingPreset,
  {
    swatch: string;
    soft: string;
    strong: string;
  }
> = STYLIZED_LIGHTING_PRESET_OPTIONS.reduce(
  (accumulator, option) => {
    const color = getSliderColorAtTime(option.time);
    const { r, g, b } = color;
    const red = Math.round(r * 255);
    const green = Math.round(g * 255);
    const blue = Math.round(b * 255);

    accumulator[option.value] = {
      swatch: `#${color.getHexString()}`,
      soft: `rgba(${red}, ${green}, ${blue}, 0.16)`,
      strong: `rgba(${red}, ${green}, ${blue}, 0.28)`,
    };

    return accumulator;
  },
  {} as Record<
    LightingPreset,
    {
      swatch: string;
      soft: string;
      strong: string;
    }
  >,
);

export const STYLIZED_LIGHTING_TIME_MARKS = [
  { label: "5 AM", value: clockMinutesToStylizedTime(5 * 60) },
  { label: "8:30 AM", value: clockMinutesToStylizedTime(8 * 60 + 30) },
  { label: "12 PM", value: clockMinutesToStylizedTime(12 * 60) },
  { label: "3:30 PM", value: clockMinutesToStylizedTime(15 * 60 + 30) },
  { label: "7 PM", value: clockMinutesToStylizedTime(19 * 60) },
];

function circularDistance(a: number, b: number) {
  const delta = Math.abs(a - b);
  return Math.min(delta, STYLIZED_TIME_RANGE - delta);
}

export function clampStylizedLightingTime(time: number) {
  return THREE.MathUtils.clamp(time, 0, STYLIZED_TIME_RANGE);
}

export function getLightingCycleProgress(time: number) {
  return clampStylizedLightingTime(time) / STYLIZED_TIME_RANGE;
}

function clamp01(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function inverseLerp(min: number, max: number, value: number) {
  if (min === max) {
    return 0;
  }

  return clamp01((value - min) / (max - min));
}

function smoothstep(min: number, max: number, value: number) {
  const t = inverseLerp(min, max, value);
  return t * t * (3 - 2 * t);
}

function kelvinToColor(kelvin: number) {
  const temperature = kelvin / 100;
  let red = 255;
  let green = 255;
  let blue = 255;

  if (temperature <= 66) {
    green = 99.4708025861 * Math.log(temperature) - 161.1195681661;
    blue =
      temperature <= 19
        ? 0
        : 138.5177312231 * Math.log(temperature - 10) - 305.0447927307;
  } else {
    red = 329.698727446 * Math.pow(temperature - 60, -0.1332047592);
    green = 288.1221695283 * Math.pow(temperature - 60, -0.0755148492);
  }

  return new THREE.Color(
    clamp01(red / 255),
    clamp01(green / 255),
    clamp01(blue / 255),
  );
}

function colorToHex(color: THREE.Color) {
  return `#${color.getHexString()}`;
}

function getInterpolatedPresetTintColor(currentTime: number) {
  return getSliderColorAtTime(currentTime);
}

function getSolarReferenceState(currentTime: number): SolarReferenceState {
  const hours = getLightingClockMinutes(currentTime) / 60;
  const gamma =
    ((2 * Math.PI) / 365) *
    (REFERENCE_SOLAR_DAY_OF_YEAR - 1 + (hours - 12) / 24);
  const equationOfTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  const timeOffset =
    equationOfTime +
    4 * REFERENCE_SOLAR_LONGITUDE_DEG -
    60 * REFERENCE_SOLAR_TIMEZONE_HOURS;
  const trueSolarMinutes = hours * 60 + timeOffset;
  const hourAngleDeg =
    ((((trueSolarMinutes / 4 - 180) % 360) + 540) % 360) - 180;
  const hourAngleRad = THREE.MathUtils.degToRad(hourAngleDeg);
  const latitudeRad = THREE.MathUtils.degToRad(REFERENCE_SOLAR_LATITUDE_DEG);
  const cosZenith =
    Math.sin(latitudeRad) * Math.sin(declination) +
    Math.cos(latitudeRad) * Math.cos(declination) * Math.cos(hourAngleRad);
  const zenithRad = Math.acos(THREE.MathUtils.clamp(cosZenith, -1, 1));
  const elevationDeg = 90 - THREE.MathUtils.radToDeg(zenithRad);
  const azimuthDenominator = Math.cos(latitudeRad) * Math.sin(zenithRad);
  const rawAzimuthDeg =
    Math.abs(azimuthDenominator) < 1e-6
      ? 180
      : THREE.MathUtils.radToDeg(
          Math.acos(
            THREE.MathUtils.clamp(
              (Math.sin(latitudeRad) * Math.cos(zenithRad) - Math.sin(declination)) /
                azimuthDenominator,
              -1,
              1,
            ),
          ),
        );
  const azimuthDeg =
    hourAngleDeg > 0 ? (rawAzimuthDeg + 180) % 360 : (540 - rawAzimuthDeg) % 360;
  const daylightFactor = smoothstep(-6, 48, elevationDeg);
  const directSunFactor = smoothstep(-2, 14, elevationDeg);
  const twilightEnvelope =
    smoothstep(-18, 2, elevationDeg) * (1 - smoothstep(8, 35, elevationDeg));
  const nightFactor = 1 - smoothstep(-12, 6, elevationDeg);
  const twilightFactor = clamp01(twilightEnvelope + directSunFactor * 0.18);
  const sunKelvin =
    elevationDeg <= 0
      ? THREE.MathUtils.lerp(
          CIE_ILLUMINANT_A_KELVIN,
          CIE_D50_KELVIN,
          smoothstep(-6, 0, elevationDeg),
        )
      : THREE.MathUtils.lerp(
          CIE_D50_KELVIN,
          CIE_D65_KELVIN,
          smoothstep(0, 45, elevationDeg),
        );

  return {
    elevationDeg,
    azimuthDeg,
    daylightFactor,
    directSunFactor,
    twilightFactor,
    nightFactor,
    sunKelvin,
  };
}

export function resolveStylizedLightingPreset(currentTime: number) {
  const safeTime = clampStylizedLightingTime(currentTime);

  return STYLIZED_LIGHTING_PRESET_OPTIONS.reduce(
    (closest, option) =>
      circularDistance(option.time, safeTime) <
      circularDistance(closest.time, safeTime)
        ? option
        : closest,
    STYLIZED_LIGHTING_PRESET_OPTIONS[0],
  ).value;
}

export function getPresetDetails(preset: LightingPreset) {
  return (
    STYLIZED_LIGHTING_PRESET_OPTIONS.find((entry) => entry.value === preset) ??
    STYLIZED_LIGHTING_PRESET_OPTIONS[0]
  );
}

export function formatLightingClock(currentTime: number) {
  const totalMinutes = getLightingClockMinutes(currentTime);
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hours = hours24 % 12 || 12;

  return `${hours}:${minutes.toString().padStart(2, "0")} ${meridiem}`;
}

function formatStylizedPalette(currentTime: number): LightingPalette {
  const solarState = getSolarReferenceState(currentTime);
  const presetTint = getInterpolatedPresetTintColor(currentTime);
  const sunColor = kelvinToColor(solarState.sunKelvin).lerp(
    new THREE.Color("#fff4df"),
    solarState.twilightFactor * 0.12,
  ).lerp(presetTint, 0.18 + solarState.twilightFactor * 0.1);
  const ambientDayColor = kelvinToColor(
    THREE.MathUtils.lerp(
      CIE_D50_KELVIN,
      CIE_D65_KELVIN,
      solarState.daylightFactor,
    ),
  );
  const ambientColor = ambientDayColor
    .clone()
    .lerp(new THREE.Color("#f3c28a"), solarState.twilightFactor * 0.18)
    .lerp(new THREE.Color("#20283a"), solarState.nightFactor * 0.86)
    .lerp(presetTint, 0.14 + solarState.nightFactor * 0.08);
  const fillColor = ambientColor
    .clone()
    .lerp(sunColor, 0.16 + solarState.twilightFactor * 0.24)
    .lerp(presetTint, 0.12);
  const rimColor = ambientColor
    .clone()
    .lerp(new THREE.Color("#ffffff"), 0.18 + solarState.daylightFactor * 0.42)
    .lerp(presetTint, 0.08);

  return {
    sunColor: colorToHex(sunColor),
    ambientColor: colorToHex(ambientColor),
    fillColor: colorToHex(fillColor),
    rimColor: colorToHex(rimColor),
    sunIntensity:
      4 * solarState.directSunFactor * (0.35 + solarState.daylightFactor * 0.65),
    fillIntensity: THREE.MathUtils.lerp(
      0.08,
      0.75,
      solarState.daylightFactor,
    ),
    rimIntensity: THREE.MathUtils.lerp(
      0.16,
      1,
      solarState.daylightFactor * 0.82 + solarState.twilightFactor * 0.18,
    ),
    ambientIntensity: THREE.MathUtils.lerp(
      0.08,
      0.5,
      smoothstep(-12, 40, solarState.elevationDeg),
    ),
  };
}

export function getStylizedLightState(
  lightId: "key" | "fill" | "rim" | "ambient",
  currentTime: number,
  orientation: number,
): StylizedLightState {
  const palette = formatStylizedPalette(currentTime);
  const solarState = getSolarReferenceState(currentTime);
  const orientationAngle = THREE.MathUtils.degToRad(orientation);
  const radius = 18;
  const azimuthAngle =
    orientationAngle + THREE.MathUtils.degToRad(solarState.azimuthDeg);
  const elevationAngle = THREE.MathUtils.degToRad(solarState.elevationDeg);
  const planarRadius = Math.max(2.5, Math.cos(elevationAngle) * radius);
  const sunHeight = Math.sin(elevationAngle) * radius;
  const x = Math.sin(azimuthAngle) * planarRadius;
  const z = Math.cos(azimuthAngle) * planarRadius;
  const focusDistance = THREE.MathUtils.lerp(1.9, 2.8, solarState.daylightFactor);
  const targetX = Math.sin(orientationAngle) * focusDistance;
  const targetZ = Math.cos(orientationAngle) * focusDistance;

  if (lightId === "key") {
    return {
      position: [x, sunHeight, z],
      target: [targetX, 1.8, targetZ],
      intensity: palette.sunIntensity,
      color: palette.sunColor,
      shadowStrength: THREE.MathUtils.lerp(0.82, 0.42, solarState.daylightFactor),
    };
  }

  if (lightId === "fill") {
    return {
      position: [-x * 0.35, Math.max(1, sunHeight * 0.42), -z * 0.28],
      target: [targetX * 0.6, 1.2, targetZ * 0.6],
      intensity: palette.fillIntensity,
      color: palette.fillColor,
      shadowStrength: 0,
    };
  }

  if (lightId === "rim") {
    return {
      position: [-x * 0.52, Math.max(1.2, sunHeight * 0.5), z * 0.44],
      target: [targetX * 0.2, 1.6, targetZ * 0.2],
      intensity: palette.rimIntensity,
      color: palette.rimColor,
      shadowStrength: 0,
    };
  }

  return {
    intensity: palette.ambientIntensity,
    color: palette.ambientColor,
    shadowStrength: 0,
  };
}

export function getStylizedBackgroundHex(currentTime: number) {
  const solarState = getSolarReferenceState(currentTime);
  const presetTint = getInterpolatedPresetTintColor(currentTime);
  const daySky = kelvinToColor(CIE_D65_KELVIN);
  const warmSky = kelvinToColor(CIE_D50_KELVIN);
  const background = daySky
    .clone()
    .lerp(warmSky, solarState.twilightFactor * 0.26)
    .lerp(new THREE.Color("#ffffff"), solarState.daylightFactor * 0.18)
    .lerp(new THREE.Color("#162032"), solarState.nightFactor * 0.9)
    .lerp(presetTint, 0.14);

  return colorToHex(background);
}
