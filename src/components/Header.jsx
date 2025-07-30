import styles from './Header.module.css';
import GameTitle from './GameTitle';
import RoundIndicator from './RoundIndicator';

const Header = ({round1, round2}) => {  
    return (
    <header className={styles.header}>
      <GameTitle />
      <RoundIndicator round1={round1} round2={round2} />
    </header>
  );
};

export default Header;

