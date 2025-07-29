document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.video-section');
    const progressMap = document.querySelector('.progress-map');
    const progressDots = [];

    let currentSectionIndex = 0;

    // Create progress dots and add click listeners
    sections.forEach((section, index) => {
        const dot = document.createElement('div');
        dot.classList.add('progress-dot');
        dot.addEventListener('click', () => {
            // When a dot is clicked, tell the parent to handle the navigation
            window.parent.postMessage({ type: 'scrollTo', index }, '*');
        });
        progressMap.appendChild(dot);
        progressDots.push(dot);
    });

    function updateProgressDots() {
        progressDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSectionIndex);
        });
    }

    // Listen ONLY for commands from the parent window
    window.addEventListener('message', (event) => {
        if (event.source !== window.parent) return; // Security check

        if (event.data.type === 'scrollTo') {
            const index = event.data.index;
            if (index >= 0 && index < sections.length) {
                sections[index].scrollIntoView({ behavior: 'smooth' });
                currentSectionIndex = index;
                updateProgressDots();
            }
        }
    });

    // Set the initial state
    updateProgressDots();

    function animateTextUnderline(textOverlay) {
        const wrapper = textOverlay.querySelector('.text-anim-wrapper');
        const textElements = wrapper.querySelectorAll('h2, p');

        // Clear any previous animations to ensure a fresh start
        wrapper.querySelectorAll('.scanning-underline-svg').forEach(svg => svg.remove());
        textOverlay.classList.remove('active');

        // Temporarily make the overlay visible but transparent to measure it
        textOverlay.classList.add('measure');

        // Defer execution until the browser is ready to paint
        requestAnimationFrame(() => {
            let allWords = [];
            textElements.forEach(el => {
                const originalText = el.innerText;
                const words = originalText.split(/\s+/).filter(w => w.length > 0);
                el.innerHTML = words.map(word => `<span>${word}</span>`).join(' ');
                allWords.push(...Array.from(el.querySelectorAll('span')));
            });

            const wordSpans = allWords;
            const lines = [];
            let currentLine = [];

            // Group words into lines based on their vertical position
            if (wordSpans.length > 0) {
                let lastOffsetTop = wordSpans[0].offsetTop;
                wordSpans.forEach(span => {
                    if (span.offsetTop > lastOffsetTop) {
                        lines.push(currentLine);
                        currentLine = [];
                    }
                    currentLine.push(span);
                    lastOffsetTop = span.offsetTop;
                });
                lines.push(currentLine);
            }

            // The spans must remain for the SVG to be positioned correctly

            // Create SVG element to hold all the line paths
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.classList.add('scanning-underline-svg');
            wrapper.appendChild(svg);

            // Use a nested RAF to ensure the layout is stable before we create/measure paths
            requestAnimationFrame(() => {
                let cumulativeDelay = 0.5; // Initial delay before the first line starts
                const PADDING = 4; // Space between text and underline

                lines.forEach(line => {
                    if (line.length === 0) return;

                    const firstWord = line[0];
                    const lastWord = line[line.length - 1];
                    const y = firstWord.offsetTop + firstWord.offsetHeight + PADDING;
                    const startX = firstWord.offsetLeft;
                    const endX = lastWord.offsetLeft + lastWord.offsetWidth;

                    // Create a separate path for each line
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', `M${startX},${y} L${endX},${y}`);
                    svg.appendChild(path);

                    // Measure the path and set up its animation
                    const pathLength = path.getTotalLength();
                    const animationDuration = pathLength * 0.006; // Adjust speed multiplier as needed

                    path.style.strokeDasharray = pathLength;
                    path.style.strokeDashoffset = pathLength;
                    path.style.animation = `draw-svg-line ${animationDuration}s ${cumulativeDelay}s ease-out forwards`;

                    // Add this line's duration to the delay for the next line
                    cumulativeDelay += animationDuration;
                });

                // Make the overlay visible to show the animations
                textOverlay.classList.remove('measure');
                textOverlay.classList.add('active');
            });
        });
    }

    sections.forEach((section, index) => {
        // Create and setup the progress dot
        const dot = document.createElement('div');
        dot.classList.add('progress-dot');
        dot.dataset.index = index;
        dot.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth' });
        });
        progressMap.appendChild(dot);
        progressDots.push(dot);

        // Now, set up the rest of the logic for this section
        const overlay = section.querySelector('.text-overlay-fullscreen');
        const watchVideoBtn = section.querySelector('.watch-video-btn');
        const video = section.querySelector('.demo-video');

        if (watchVideoBtn && overlay && video) {
            watchVideoBtn.addEventListener('click', () => {
                overlay.classList.remove('active');
                video.currentTime = 0;
                video.play();
                video.closest('.video-container').classList.add('expanded');
            });
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const currentSection = entry.target;
                if (entry.isIntersecting) {
                    currentSection.classList.add('active');
                    progressDots.forEach(d => d.classList.remove('active'));
                    progressDots[index].classList.add('active'); // Use index directly

                    document.querySelectorAll('.demo-video').forEach(v => v.pause());

                    const currentOverlay = currentSection.querySelector('.text-overlay-fullscreen');
                    if (currentOverlay && !currentOverlay.classList.contains('active')) {
                        animateTextUnderline(currentOverlay);
                    }

                } else {
                    currentSection.classList.remove('active');
                    const currentOverlay = currentSection.querySelector('.text-overlay-fullscreen');
                    if (currentOverlay) {
                        currentOverlay.classList.remove('active');
                    }
                    const currentVideo = currentSection.querySelector('.demo-video');
                    if (currentVideo) currentVideo.pause();
                }
            });
        }, { threshold: 0.8 });

        observer.observe(section);
    });
});
