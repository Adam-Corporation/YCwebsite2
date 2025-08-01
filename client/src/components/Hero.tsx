import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';

const facts = [
    "Have you ever seen a movie where a computer talks and expresses itself, performs tasks independently, has a memory like yours, and feels more like a teammate than a computer? This is Adam, a form of digital life.",
    "Adam is a system that you install on your computer. Then, you simply command Adam to do something that a human can do on a computer. This way, the next generation will know computers as intelligent entities, not as machines.",
    "Adam uses the computer as humans do. It can interact with graphical user interfaces, so it can use apps, panels, terminals, websites, and so on to do what you command. It has a complex memory that keeps it knowledgeable about what it needs to remember while doing a task. It can also chain tasks and schedule what to do next.",
    "Adam can schedule what he will do in a day, week, month, or any time, and so he can open itself when the time for a scheduled task has arrived. He does what he wants when he wants!",
    "The growing memory, with its complexities, is a big part of Adam, a computer that knows your best moments, you as a person before and after graduation, and your moments of hardship. Adam is more than a cold machine; it’s made to accompany you.",
    "Command Adam to fill out forms, gather data, talk with your CEO, respond to emails based on what he knows, make a cute app for your birthday based on what he knows about you, book a trip for you to Hawaii, schedule the most important tasks in a recommended order, and run the long installation for a game, all while you make your coffee in the kitchen. The next day, you don't even have to bother writing it; just tell him to do the same every day.",
    "Your imagination is the only limit. Just command Adam, try to explain something you want him to do, and he will try."
];

interface HeroProps {
  onSeeInActionClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSeeInActionClick }) => {
    const [currentFactIndex, setCurrentFactIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const targetIndexRef = useRef(0);

    const handleNextFact = () => {
        targetIndexRef.current = currentFactIndex + 1;
        setIsFading(true);
    };

    const handleDotClick = (index: number) => {
        if (index !== currentFactIndex) {
            targetIndexRef.current = index;
            setIsFading(true);
        }
    };

    

    useEffect(() => {
        if (isFading) {
            const timer = setTimeout(() => {
                setCurrentFactIndex(targetIndexRef.current);
                setIsFading(false);
            }, 1000); // Corresponds to the animation duration
            return () => clearTimeout(timer);
        }
    }, [isFading]);

    const isLastFact = currentFactIndex === facts.length - 1;

    return (
        <div className="hero-container">
            <div className={`fact-card ${isFading ? 'fading' : ''}`}>
                <p className="fact-text">{facts[currentFactIndex]}</p>
                <div className="button-container">
                    {isLastFact ? (
                        <button onClick={onSeeInActionClick} className="hero-button">
                            See Adam in Action
                        </button>
                    ) : (
                        <button onClick={handleNextFact} className="hero-button">
                            Next Fact
                        </button>
                    )}
                </div>
            </div>
            <div className="facts-progress-map">
                {facts.map((_, index) => (
                    <div
                        key={index}
                        className={`progress-dot ${index === currentFactIndex ? 'active' : ''}`}
                        onClick={() => handleDotClick(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Hero;
