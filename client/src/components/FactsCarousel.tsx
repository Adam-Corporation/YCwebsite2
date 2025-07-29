import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { facts } from '../data/facts';
import './FactsCarousel.css';

const FactsCarousel: React.FC = () => {
    const [factIndex, setFactIndex] = useState(0);

    const handleButtonClick = () => {
        if (factIndex < facts.length - 1) {
            setFactIndex(factIndex + 1);
        } else {
            document.getElementById('video-showcase')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const isLastFact = factIndex === facts.length - 1;

    return (
        <div className="facts-container">
            <AnimatePresence mode="wait">
                <motion.div
                    key={factIndex}
                    className="fact-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }}
                    exit={{ opacity: 0, transition: { duration: 1.5, ease: 'easeIn' } }}
                >
                    <p className="fact-text">{facts[factIndex]}</p>
                    <button className="next-fact-btn" onClick={handleButtonClick}>
                        {isLastFact ? 'Watch Adam in action' : 'Next Fact'}
                    </button>
                </motion.div>
            </AnimatePresence>

            {/* Progress Map */}
            <div className="facts-progress-map">
                {facts.map((_, index) => (
                    <div
                        key={index}
                        className={`progress-stone ${index === factIndex ? 'active' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default FactsCarousel;
