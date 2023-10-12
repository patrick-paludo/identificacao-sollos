import { Button, Modal, Upload, UploadFile, UploadProps, message } from 'antd'
import { CameraOutlined, CheckCircleOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import { useEffect, useState } from 'react';
import styles from './App.module.css';
import Loader from './components/loader/Loader';

interface ResultadoProps {
  product: string;
  probability: string;
}

function App() {
  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [resultado, setResultado] = useState<null | ResultadoProps>(null);
  const [modal, contextHolder] = Modal.useModal();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file?: UploadFile) => {
    let preview;
    if (!file) {
      preview = await getBase64(fileList[0]?.originFileObj as RcFile);
    } else if (!file?.url && !file?.preview) {
      file!.preview = await getBase64(file?.originFileObj as RcFile);
    }

    setPreviewImage(file?.url || (file?.preview as string) || (preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file?.name || file?.url!.substring(file.url!.lastIndexOf('/') + 1) || fileList[0].name);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const uploadButton = (
    <div>
      <CameraOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleSubmit = async () => {
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      message.error("Selecione uma imagem");
      return
    }

    setLoading(true);

    const file = fileList[0].originFileObj as RcFile;

    const formData = new FormData();
    formData.append('image', file);
    const url = import.meta.env.DEV ? 'http://localhost:3000/api' : 'https://identificacao-sollos.ppaludo.dev.br/api';
    console.log(url);
    const result = await (await fetch(`${url}/classify`, {
      method: 'POST',
      body: formData
    })).json();

    if (!result || !result.success || result.error) {
      message.error("Erro ao classificar: " + result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    setResultado(result.result);
  }

  useEffect(() => {
    console.log(resultado)
    if (resultado) {
      modal.success({
        icon: null,
        content: (
          <div className={styles.result}>
            <div className={styles.title}>
              <CheckCircleOutlined style={{ color: 'green' }} />
              <h2>Resultado:</h2>
            </div>
            <span><h3>Produto: </h3>{resultado.product}</span>
            <span><h3>Confiança: </h3>{resultado.probability}%</span>
          </div>
        ),
        onOk: () => {
          setResultado(null);
        }
      })
    }
  }, [resultado]);

  return (
    <>
      {contextHolder}
      <div className={styles.container}>
        {loading && <Loader />}
        <div>
          <h1>Identificação de produtos</h1>
          <h2>Sollos</h2>
        </div>
        <div className={styles.uploadContainer}>
          <div className={styles.upload}>
            <Upload
              listType="picture-circle"
              fileList={fileList}
              onChange={handleChange}
              onPreview={handlePreview}
              maxCount={1}
              capture="camera"
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </div>
          <div>
            <p>
              Tire uma foto do componente para classificá-lo
            </p>
          </div>
        </div>
        <div className={styles.actionsContainer}>
          <div className={styles.actions}>
            {fileList.length >= 1 && (
              <>
                <Button onClick={() => handlePreview()}><EyeOutlined /> Pré-visualizar</Button>
                <Button danger onClick={() => setFileList([])}><DeleteOutlined /> Limpar</Button>
              </>
            )}
          </div>
        </div>

        <div className={styles.submitButton}>
          <Button size='large' type="primary" htmlType="button" onClick={handleSubmit} >
            <SearchOutlined />
            Classificar
          </Button>
        </div>

        <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>

      </div>
    </>
  )
}
export default App
