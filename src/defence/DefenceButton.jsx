import styles from './DefenceButton.module.css';
const DefenceButton = () => {
  //const router = useRouter();
  const goToPage = () => {
    //router.push('/defence');
  };
    return (
    <div className={styles.wrapperDB}>
      <a className={styles.title}  onClick={goToPage}>Defence planning</a>
    </div>
  );
};

export default DefenceButton;