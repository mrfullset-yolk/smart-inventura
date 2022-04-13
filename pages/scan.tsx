import { useRouter } from "next/router";
import React, { useState, useRef, useEffect } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import InputWithButton from "../components/InputWithButton";
import NumberSelector from "../components/NumberSelector";
import { getCatalog } from "../service/api.service";
import { addOrUpdateProduct, getProduct } from "../service/LocalStorageService";
import StorageProduct from "../types/StorageProduct";
import styles from "./scan.module.scss";

const ScanPage = () => {
  const [scannedQuantity, setScannedQuantity] = useState(0);
  const [productData, setProductData] = useState<StorageProduct | null>();

  const scanRef = useRef<HTMLInputElement>(null);
  const [scan, setScan] = useState("");

  const router = useRouter();

  const onScan = (e: string) => {
    if (!scanRef.current) {
      return;
    }

    fetchProductData(scan);
    setScan("");
    (scanRef.current as any).focus();
  };

  const fetchProductData = async (code: string) => {
    const localProduct = getProduct(code);

    if (!localProduct) {
      const response = await getCatalog(code);
      if (!response.winstrom["skladova-karta"][0]) {
        alert("You scanned non existing item 🤔\nWe’ll ignore it.");
        return;
      }
      const remoteName = response.winstrom["skladova-karta"][0]["cenik@showAs"];
      const whQuantity =
        response.winstrom["skladova-karta"][0]["stavMjSPozadavky"];
      const product = {
        name: remoteName,
        code: code,
        warehouseQuantity: whQuantity,
        scannedQuantity: 1,
      };
      addOrUpdateProduct(product);
      setScannedQuantity(1);
      setProductData(product);
    } else {
      setScannedQuantity(localProduct.scannedQuantity + 1);
      addOrUpdateProduct({
        ...localProduct,
        scannedQuantity: localProduct.scannedQuantity + 1,
      });
      setProductData(localProduct);
    }
  };

  useEffect(() => {
    (scanRef.current as any).focus();
  }, []);

  const onScannedQuantityChange = (e: number) => {
    setScannedQuantity(e);
    addOrUpdateProduct({ ...productData!, scannedQuantity: e });
  };

  const onItemDiscard = () => {
    setScannedQuantity(0);
    addOrUpdateProduct({
      ...productData!,
      scannedQuantity: 0,
    });
  };

  const onSessionEnd = () => {
    const result = confirm("Do you want to review goods?");
    if (result) {
      router.push("/scanned-items");
    } else {
      router.push("/done");
    }
  };

  return (
    <Container className={styles.scan}>
      <div className={styles.main}>
        <Row>
          <h1 className="display-1">Scan item 📦</h1>
          <p>or enter code manually</p>
        </Row>
        <Row>
          <InputWithButton
            buttonText="OK"
            placeholder="Product code"
            onClick={onScan}
            ref={scanRef}
            value={scan}
            onValueChange={setScan}
          />
        </Row>
        <Row className={styles.content}>
          <Col className={styles.labels}>
            <p>Name</p>
            <p>Code</p>
            <p>Quantity (w\h)</p>
          </Col>
          <Col>
            <p>{productData?.name}</p>
            <p>{productData?.code}</p>
            <p>{productData?.warehouseQuantity}</p>
          </Col>
        </Row>
        <Row className={styles.quantity}>
          <p>Scanned quantity</p>
          <NumberSelector
            value={scannedQuantity}
            onChange={onScannedQuantityChange}
          />
        </Row>
      </div>
      <div className={styles.controls}>
        <Row>
          <Col xs={6}>
            <Button onClick={onItemDiscard} variant="outline-primary">
              Discard item
            </Button>
          </Col>
          <Col xs={6}>
            <Button onClick={onSessionEnd}>End session</Button>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Button
              variant="outline-primary"
              onClick={() => {
                router.push("/scanned-items");
              }}
            >
              Show scanned items
            </Button>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default ScanPage;
