/**
 * webpack DefinePlugin 으로 주입되는 전역 플래그.
 * 개발 모드는 true, 운영 빌드는 false 로 치환된다.
 */
declare const __DEV__: boolean
