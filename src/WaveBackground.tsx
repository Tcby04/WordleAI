import React from 'react';
import styled, { keyframes } from 'styled-components';

const animate = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
    border-radius: 0;
  }
  100% {
    transform: translateY(-1000px) rotate(720deg);
    opacity: 0;
    border-radius: 50%;
  }
`;

const BackgroundWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  background: transparent;
`;

const AnimatedLetters = styled.ul`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Letter = styled.li`
  position: absolute;
  display: block;
  list-style: none;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.07);
  animation: ${animate} 25s linear infinite;
  bottom: -150px;
  color: rgba(255, 255, 255, 0.1);
  font-size: 36px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;

  &:nth-child(1) {
    left: 25%;
    width: 80px;
    height: 80px;
    animation-delay: 0s;
  }

  &:nth-child(2) {
    left: 10%;
    width: 50px;
    height: 50px;
    animation-delay: 2s;
    animation-duration: 12s;
  }

  &:nth-child(3) {
    left: 70%;
    width: 60px;
    height: 60px;
    animation-delay: 4s;
  }

  &:nth-child(4) {
    left: 40%;
    width: 70px;
    height: 70px;
    animation-delay: 0s;
    animation-duration: 18s;
  }

  &:nth-child(5) {
    left: 65%;
    width: 55px;
    height: 55px;
    animation-delay: 0s;
  }

  &:nth-child(6) {
    left: 75%;
    width: 90px;
    height: 90px;
    animation-delay: 3s;
  }

  &:nth-child(7) {
    left: 35%;
    width: 100px;
    height: 100px;
    animation-delay: 7s;
  }

  &:nth-child(8) {
    left: 50%;
    width: 65px;
    height: 65px;
    animation-delay: 15s;
    animation-duration: 45s;
  }

  &:nth-child(9) {
    left: 20%;
    width: 55px;
    height: 55px;
    animation-delay: 2s;
    animation-duration: 35s;
  }

  &:nth-child(10) {
    left: 85%;
    width: 95px;
    height: 95px;
    animation-delay: 0s;
    animation-duration: 11s;
  }
`;

const WaveBackground: React.FC = () => {
  const letters = ['W', 'O', 'R', 'D', 'L', 'E', 'A', 'I', 'U', 'S'];

  return (
    <BackgroundWrapper>
      <AnimatedLetters>
        {letters.map((letter, index) => (
          <Letter key={index}>{letter}</Letter>
        ))}
      </AnimatedLetters>
    </BackgroundWrapper>
  );
};

export default WaveBackground; // Make sure this line is present
