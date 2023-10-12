import styles from './Loader.module.css';

export default function Loader() {
  return (
    <div className={styles.loader}>
      <div>
        <h1>Processando...</h1>
        <h2>Por favor, aguarde!</h2>
      </div>
    </div>
  );
}