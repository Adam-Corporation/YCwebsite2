import React, { useState, useEffect, useRef } from 'react';
import Hero from '../components/Hero';
import Video from '../components/Video';
import Footer from '../components/footer';
import ProgressMap from '../components/ProgressMap';
import './Home.css';

const videoData = [
  {
    title: 'Adam says his first "Hello, World!"',
    explanation: 'That\'s one small step for man, one giant leap for mankind.',
    detailedExplanation: 'This is an emotional moment, showing the first AGI in humankind speaking and expressing its emotions with facial expressions.',
    videoSrc: '/Videos/1-HelloWorldv2.mp4',
  },
  {
    title: 'Adam\'s Memory',
    explanation: 'A computer that never forgets your important moments, your preferences, who you are, and what you are doing, using this knowledge in its daily tasks and interaction style with you.',
    detailedExplanation: 'This example shows exactly what we mean by memory. Adam has a complex memory that will gain even higher complexities over the course of this product\'s development. His memory mimics a human\'s. In this example, the user told Adam that in the coming months, they will be learning video editing. The next day, the user asked Adam what he was busy with, and his remembrance felt natural.',
    videoSrc: '/Videos/2-MemoryTestv1.mp4',
  },
  {
    title: 'ChatGPT vs. Adam',
    explanation: 'A demonstration of the difference between the hype of chatbots and AGI.',
    detailedExplanation: 'In this philosophical example, the user commanded Adam to ask ChatGPT what AGI is and to get a summary of its answer. Adam opened the Edge window, found the ChatGPT tab, asked the question, and finally wrote the summary in the chat.',
    videoSrc: '/Videos/3-ChatGPTFinalVersion.mp4',
  },
  {
    title: 'Web3 with Adam',
    explanation: 'Adam can use websites to carry out users\' commands, just like you do.',
    detailedExplanation: 'In this example, the user asked Adam to fill out and submit a Google Form by himself while the user watched. Adam opened the Edge window, found the Google Forms tab for the OS quiz, filled it out, and finally submitted it. Adam can execute a batch of instructions at the same time to interact with a web page or web app and perform a limitless number of actions in one batch. This is different from the approach of numerous other agents that take a long time to do a trivial action.',
    videoSrc: '/Videos/4-GoogleFormsTestv2.mp4',
  },
  {
    title: 'Adam might use your Google account while he\'s doing a task',
    explanation: 'Adam is brave and can easily sign in to a service or a website like Medium using a Google account.',
    detailedExplanation: 'In this example, the user commanded Adam to sign in to Medium using his ensia.edu.dz school email, and it was very smooth. In worse-case scenarios, like a very hard reCAPTCHA, Adam might ask the user to do it for him, but he will definitely still try to complete the task one way or another.',
    videoSrc: '/Videos/5-SignInTest - Made with Clipchamp.mp4',
  },
  {
    title: 'Adam\'s first Tweet on X',
    explanation: 'Surely an AGI like Adam can use social media platforms as easily as creating a text file.',
    detailedExplanation: 'Adam can use your accounts and do everything you want with them. You can ask him to respond to your post\'s comments, give you a summary of the comments he read, or create 10 new posts with the last 10 pictures and a good description for each. In this example, the user commands Adam to post something of his choice on X, and he chose to introduce himself.',
    videoSrc: '/Videos/6-TweetTest - Made with Clipchamp.mp4',
  },
  {
    title: 'Adam interacts with graphical user interfaces',
    explanation: 'Adam interacts with desktop apps like Settings, Taskbar, and control panels, but in a different way than he interacts with websites.',
    detailedExplanation: 'When dealing with GUIs, Adam needs some predefined metadata (a driver) about that app or panel so he can use it as fast and reliably as possible and chain some app actions with other types of actions to accomplish something. In this example, the user commanded Adam to perform a batch of control actions from the control & notifications panels and the Settings app.',
    videoSrc: '/Videos/7-GuiBasicTest - Made with Clipchamp.mp4',
  },
  {
    title: 'Adam uses the Terminal',
    explanation: 'The command prompt is typically for advanced computer users, but in numerous scenarios, using it is far more powerful, faster, and easier for Adam.',
    detailedExplanation: 'The difference between Adam and other command-line agents is that Adam uses the Terminal app as the user does. He can open multiple tabs with different profiles, from Linux WSL in Windows to PowerShell to CMD in Windows, and so on, and interact with his commands exactly as the user does. Plus, Adam can just close the Terminal, like the user, if a command gets stuck or there are security warnings. In this example, the user commanded Adam to play an interactive question game in the Terminal. Of course, you can command him to use any terminal program.',
    videoSrc: '/Videos/8-TerminalBasicTest - Made with Clipchamp.mp4',
  },
];

const Home = () => {
    const [activeVideoIndex, setActiveVideoIndex] = useState(-1);

    const sectionRefs = useRef<(HTMLElement | null)[]>([]);

    const handleDotClick = (index: number) => {
        const section = sectionRefs.current[index + 1];
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleScrollToFirstVideo = () => {
        const firstVideoSection = sectionRefs.current[1];
        if (firstVideoSection) {
            firstVideoSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // Find the entry that is most visible on the screen
                const mostVisibleEntry = entries.reduce((prev, current) => {
                    return prev.intersectionRatio > current.intersectionRatio ? prev : current;
                });

                if (mostVisibleEntry.isIntersecting) {
                    const id = mostVisibleEntry.target.id;
                    if (id.startsWith('video-')) {
                        setActiveVideoIndex(parseInt(id.split('-')[1], 10));
                    } else {
                        // It's the hero or footer, so no video is active
                        setActiveVideoIndex(-1);
                    }
                }
            },
            { threshold: 0.5 } // A 50% threshold is good for full-screen sections
        );

        const currentRefs = sectionRefs.current;
        currentRefs.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            currentRefs.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, []); // Removed activeVideoIndex from the dependency array

    return (
        <div className="home-container">
            <ProgressMap
                videoCount={videoData.length}
                currentVideo={activeVideoIndex}
                visible={activeVideoIndex !== -1}
                onDotClick={handleDotClick}
            />
            <main className="scroll-container">
                <section
                    id="hero"
                    className="scroll-section"
                    ref={(el) => (sectionRefs.current[0] = el)}
                >
                    <Hero onSeeInActionClick={handleScrollToFirstVideo} />
                </section>
                {videoData.map((video, index) => (
                    <section
                        key={index}
                        id={`video-${index}`}
                        className="scroll-section"
                        ref={(el) => (sectionRefs.current[index + 1] = el)}
                    >
                        <Video
                            title={video.title}
                            explanation={video.explanation}
                            detailedExplanation={video.detailedExplanation}
                            videoSrc={video.videoSrc}
                            isVisible={index === activeVideoIndex}
                        />
                    </section>
                ))}
                <section
                    id="footer"
                    className="scroll-section"
                    ref={(el) => (sectionRefs.current[videoData.length + 1] = el)}
                >
                    <Footer />
                </section>
            </main>
        </div>
    );
};

export default Home;

