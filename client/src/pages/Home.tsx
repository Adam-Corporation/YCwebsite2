import React, { useState, useEffect, useRef } from 'react';
import Hero from '../components/Hero';
import Video from '../components/Video';
import Footer from '../components/footer';
import ProgressMap from '../components/ProgressMap';
import './Home.css';

const videoData = [
  {
    
    title: 'Adam says his first Hello World',
    explanation: 'That\'s one small step for man, one giant leap for mankind.',
    detailedExplanation: 'This is just an emotional moment for the first AGI in humankind speaking and expressing his emotions with facial expressions.',
    videoSrc: '/Videos/1-HelloWorldv2.mp4',
  },
  {
    title: 'Adam\'s Memory',
    explanation: 'A computer that never forgets your important moments, your preferences, who you are and what you are doing, and it uses this knowledge in its daily tasks and its interaction style with you.',
    detailedExplanation: 'This is an example of how exactly we mean by memory, Adam have complex memory and will get even higher complexities over time of this product development, his memory mimics human one, and in this example the user told Adam that in the next months I will be learning videos editing and the next day the user asked Adam what He was busy doing and His remembrance feels normal.',
    videoSrc: '/Videos/2-MemoryTestv1.mp4',
  },
  {
    title: 'ChatGPT Vs Adam',
    explanation: 'A demonstration of the difference between the hype of chatbots and AGI.',
    detailedExplanation: 'In this philosophic example, the user commanded Adam to ask ChatGPT what AGI is and get a summary of its answer, so Adam opened the window of Edge and found the tab of ChatGPT, asked it the question, and finally wrote it to the chat.',
    videoSrc: '/Videos/3-ChatGPTFinalVersion.mp4',
  },
  {
    title: 'Web3 with Adam',
    explanation: 'Adam can use websites to do users\’ commands, just like you do.',
    detailedExplanation: 'In this example, the user asked Adam to fill out a Google form by himself and submit, while the user is watching, so Adam opened Edge’s window and searched the tab of Google Forms about the OS quiz, filled it and finally submitted, and so Adam can execute a batch of instructions in the same time to interact with a web page or web app and do non limited number of actions in one batch of instructions which is different than the appraoch of numerous of agents that take long time only to do trivial action.',
    videoSrc: '/Videos/4-GoogleFormsTestv2.mp4',
  },
  {
    title: 'Adam might use your Google account while he\'s doing a task',
    explanation: 'Adam is brave and can sign in easily using a Google account on a service or a website like Medium.',
    detailedExplanation: 'In this example, the user commanded Adam to sign in to Medium using his ensia.edu.dz school email, and it was very smooth. If there were worse scenarios, like a very hard reCAPTCHA, maybe Adam will ask the user to do it for him, but still, he will definitely try to do the task in one way or another.',
    videoSrc: '/Videos/5-SignInTest - Made with Clipchamp.mp4',
  },
  {
    title: 'Adam\'s first Tweet on X',
    explanation: 'Surely an AGI like Adam can use social media platforms as easily as creating a text file.',
    detailedExplanation: 'Adam can use your accounts and do everything you want with them, you can ask him to respond on your post’s comments or give you a summary of the comments he read or create 10 new posts with the last 10 pics with a good description to each, in this example the user command Adam to post a new post by his choice on X and he chose to introduce himself.',
    videoSrc: '/Videos/6-TweetTest - Made with Clipchamp.mp4',
  },
  {
    title: 'Adam interacts with Graphical user interfaces',
    explanation: 'Adam interacts with desktop apps like Settings, Taskbar and control panels but in a different way than websites.',
    detailedExplanation: 'When treating with GUIs Adam need some predefined metadata (driver) about that app or panel so he can use it as fast and relaible as possible and chain some apps actions with other types of actions to do something, in this example the user commended Adam to do a batch of control actions from the control & notifications panels and Settings app.',
    videoSrc: '/Videos/7-GuiBasicTest - Made with Clipchamp.mp4',
  },
  {
    title: 'Adam uses the Terminal',
    explanation: 'Command prompt is typically for advanced users of computers, but in numerous scenarios, using it is far powerful, faster and easier for Adam.',
    detailedExplanation: 'The difference between Adam and a others command line agents is that Adam use the Terminal app like the user do, he can open multiple tabs with different profiles from Linux wsl in windows to powershell to cmd in windows and so on, and interact with his commands like the user exactly do, plus that Adam can just close the Terminal like the user do if a command stuck or there is a security warnings, in this example the user commanded Adam to play an interactive questions game in the Terminal, of course you can command it to use any terminal program.',
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

