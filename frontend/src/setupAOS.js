import AOS from 'aos';
import 'aos/dist/aos.css';

export default function setupAOS() {
  AOS.init({
    duration: 900,
    once: true,
    offset: 80,
    easing: 'ease-in-out',
  });
}
