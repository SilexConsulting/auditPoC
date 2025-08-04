export const initGDS = () => {
  // Initialize all GDS components
  document.addEventListener('DOMContentLoaded', () => {
    // @ts-ignore
    window.GOVUKFrontend?.initAll();
  });
};