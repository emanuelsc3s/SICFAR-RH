import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Keyboard, CheckCircle, XCircle, Scan } from 'lucide-react';
import { toast } from 'sonner';

interface VoucherData {
  codigo: string;
  beneficiario: string;
  valor: number;
  estabelecimento: string;
  dataValidade: string;
  status: 'ativo' | 'usado' | 'expirado';
}

const ScannerParceiro = () => {
  const [scannedCode, setScannedCode] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const [voucherData, setVoucherData] = useState<VoucherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('scanner');

  // Simulação de dados do voucher para demonstração
  const simulateVoucherLookup = (codigo: string): VoucherData | null => {
    const mockVouchers: { [key: string]: VoucherData } = {
      'VCH123456': {
        codigo: 'VCH123456',
        beneficiario: 'João Silva',
        valor: 150.00,
        estabelecimento: 'Farmácia Central',
        dataValidade: '2024-12-31',
        status: 'ativo'
      },
      'VCH789012': {
        codigo: 'VCH789012',
        beneficiario: 'Maria Santos',
        valor: 80.00,
        estabelecimento: 'Farmácia Central',
        dataValidade: '2024-11-30',
        status: 'usado'
      }
    };

    return mockVouchers[codigo] || null;
  };

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      const code = result[0].rawValue;
      setScannedCode(code);
      processVoucherCode(code);
      setCameraEnabled(false);
    }
  };

  const handleError = (error: any) => {
    console.info('Scanner error:', error);
  };

  const processVoucherCode = async (codigo: string) => {
    setIsLoading(true);
    
    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const voucher = simulateVoucherLookup(codigo);
      
      if (voucher) {
        setVoucherData(voucher);
        if (voucher.status === 'ativo') {
          toast.success('Voucher válido encontrado!');
        } else if (voucher.status === 'usado') {
          toast.error('Voucher já foi utilizado!');
        } else {
          toast.error('Voucher expirado!');
        }
      } else {
        toast.error('Voucher não encontrado!');
        setVoucherData(null);
      }
    } catch (error) {
      toast.error('Erro ao consultar voucher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processVoucherCode(manualCode.trim());
    }
  };

  const confirmVoucherUse = async () => {
    if (!voucherData) return;

    setIsLoading(true);
    
    try {
      // Simular confirmação de uso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVoucherData({
        ...voucherData,
        status: 'usado'
      });
      
      toast.success('Atendimento confirmado com sucesso!');
    } catch (error) {
      toast.error('Erro ao confirmar atendimento');
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedCode('');
    setManualCode('');
    setVoucherData(null);
    setCameraEnabled(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-500';
      case 'usado':
        return 'bg-gray-500';
      case 'expirado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="w-4 h-4" />;
      case 'usado':
      case 'expirado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Scanner Parceiro
          </h1>
          <p className="text-muted-foreground">
            Escaneie ou digite o código do voucher para validar o benefício
          </p>
        </div>

        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="scanner" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Escanear QR Code
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                Código Manual
              </TabsTrigger>
            </TabsList>

            {/* Scanner Tab */}
            <TabsContent value="scanner" className="space-y-6">
              <div className="text-center">
                {!cameraEnabled ? (
                  <div className="space-y-4">
                    <div className="w-32 h-32 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Scan className="w-16 h-16 text-primary" />
                    </div>
                    <Button 
                      onClick={() => setCameraEnabled(true)}
                      className="w-full sm:w-auto"
                      size="lg"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Ativar Câmera
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="max-w-md mx-auto rounded-lg overflow-hidden">
                      <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        constraints={{
                          facingMode: 'environment'
                        }}
                        styles={{
                          container: {
                            width: '100%',
                          }
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCameraEnabled(false)}
                    >
                      Fechar Câmera
                    </Button>
                  </div>
                )}
              </div>

              {scannedCode && (
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Código escaneado:</p>
                  <p className="font-mono font-semibold">{scannedCode}</p>
                </div>
              )}
            </TabsContent>

            {/* Manual Tab */}
            <TabsContent value="manual" className="space-y-6">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-code">Código do Voucher</Label>
                  <Input
                    id="manual-code"
                    placeholder="Digite o código do voucher (ex: VCH123456)"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!manualCode.trim() || isLoading}
                >
                  {isLoading ? 'Consultando...' : 'Consultar Voucher'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Voucher Information */}
          {voucherData && (
            <>
              <Separator className="my-6" />
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2">Informações do Voucher</h3>
                </div>

                <Card className="p-6 border-2">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{voucherData.codigo}</h4>
                      <p className="text-muted-foreground">Código do Voucher</p>
                    </div>
                    <Badge 
                      className={`${getStatusColor(voucherData.status)} text-white flex items-center gap-1`}
                    >
                      {getStatusIcon(voucherData.status)}
                      {voucherData.status === 'ativo' ? 'Ativo' : 
                       voucherData.status === 'usado' ? 'Utilizado' : 'Expirado'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Beneficiário</Label>
                      <p className="font-semibold">{voucherData.beneficiario}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Valor</Label>
                      <p className="font-semibold text-primary text-lg">
                        R$ {voucherData.valor.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Estabelecimento</Label>
                      <p className="font-semibold">{voucherData.estabelecimento}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Válido até</Label>
                      <p className="font-semibold">{voucherData.dataValidade}</p>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {voucherData.status === 'ativo' && (
                    <Button 
                      onClick={confirmVoucherUse}
                      disabled={isLoading}
                      className="flex-1"
                      size="lg"
                    >
                      {isLoading ? 'Confirmando...' : 'Confirmar Atendimento'}
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={resetScanner}
                    className="flex-1"
                    size="lg"
                  >
                    Novo Scanner
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ScannerParceiro;