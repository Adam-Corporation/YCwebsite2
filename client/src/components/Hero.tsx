import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';

const facts = [
    "Have you ever seen a movie where a computer talks and expresses itself, performs tasks independently, has a memory like yours, and feels like a teammate more than a computer? This is Adam, a form of digital life",
    
    "Adam is a system that you install on your computer. Then, you simply command Adam to do something that a human can do on a computer. This way, the next generation will know computers as intelligent entities, not as machines",
    
    "Adam use the computer like human do, it can interact with graphical user interfaces so he can use apps or panels ,terminals, websites and so on to do what you command, it have complex memory that keep it in knowledge with what he need to remember while his doing a task, he can chain tasks and schedule what to do next",
    
    "Adam can schedule what he will do in a day,week, months and any time and so he can open itself when the time for a task that he scheduled  has fired , he do what he want when he want!",
    
    "The growing memory with its complexities is a big part of Adam, a computer that knows your best moments, you as a person before and after graduation, moments of hardship. Adam is more than a cold machine; It’s made to accompany you",
    
    "Command Adam to fill forms, gather data, talk with your CEO, respond to emails based on what he know, make cute app for your birthday based on what he know about you, book a trip for you to Hawai, schedule most important tasks in recomanded order, and run the long installation for a game, all of that while you make your coffee in the kitchen, and the next day do not even bother to write it just till him to do the same every day",
    
    "Your imagination is the only limit, just command Adam, try to explain something you want him to do, and he will try"
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
