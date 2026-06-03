import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  BookOpen, 
  FileCheck, 
  History, 
  Home, 
  Menu, 
  Plus, 
  Printer, 
  Settings, 
  Trash2, 
  Users, 
  Edit, 
  Search, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Download, 
  Upload, 
  Info, 
  RefreshCw, 
  FileText, 
  Check, 
  Share2,
  FileSpreadsheet
} from "lucide-react";
import { Professor, Nucleo, ConfiguracoesEscola, Recibo } from "./types";
import { 
  numeroParaExtenso, 
  INITIAL_TEACHERS, 
  INITIAL_NUCLEI, 
  INITIAL_SCHOOL, 
  INITIAL_RECEIPTS, 
  getFromStorage, 
  saveToStorage 
} from "./utils";

export default function App() {
  const excelImportInputRef = useRef<HTMLInputElement>(null);
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // States with LocalStorage Hydration
  const [teachers, setTeachers] = useState<Professor[]>(() => 
    getFromStorage<Professor[]>("esteadeb_teachers", INITIAL_TEACHERS)
  );
  const [nuclei, setNuclei] = useState<Nucleo[]>(() => 
    getFromStorage<Nucleo[]>("esteadeb_nuclei", INITIAL_NUCLEI)
  );
  const [schoolSettings, setSchoolSettings] = useState<ConfiguracoesEscola>(() => 
    getFromStorage<ConfiguracoesEscola>("esteadeb_school", INITIAL_SCHOOL)
  );
  const [receipts, setReceipts] = useState<Recibo[]>(() => 
    getFromStorage<Recibo[]>("esteadeb_receipts", INITIAL_RECEIPTS)
  );

  // Notification Banner
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const triggerNotification = (text: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info" | "primary";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    variant: "danger"
  });

  const showConfirm = (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info" | "primary";
  }) => {
    setConfirmModal({
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: options.onConfirm,
      confirmText: options.confirmText || "Confirmar",
      cancelText: options.cancelText || "Cancelar",
      variant: options.variant || "danger"
    });
  };

  // Sync to localStorage when states update
  useEffect(() => {
    saveToStorage("esteadeb_teachers", teachers);
  }, [teachers]);

  useEffect(() => {
    saveToStorage("esteadeb_nuclei", nuclei);
  }, [nuclei]);

  useEffect(() => {
    saveToStorage("esteadeb_school", schoolSettings);
  }, [schoolSettings]);

  useEffect(() => {
    saveToStorage("esteadeb_receipts", receipts);
  }, [receipts]);

  // Unified render printable receipt helper targeting custom templates (docente / coordenador_secretario)
  const renderPrintReceiptContent = (rcb: Recibo) => {
    if (rcb.template === "coordenador_secretario") {
      return (
        <div className="space-y-3.5 text-black font-serif text-left">
          {/* Centered Logo & Brand */}
          <div className="text-center relative">
            <img 
              src={schoolSettings.logoUrl || defaultSchoolLogo} 
              alt="ESTEADEB" 
              className="w-13 h-13 mx-auto object-contain block mb-1"
              referrerPolicy="no-referrer"
            />
            <h2 className="text-base font-bold tracking-tight uppercase font-sans text-neutral-900 leading-none">
              {schoolSettings.nome}
            </h2>
            <h3 className="text-xs font-bold tracking-widest uppercase font-sans text-gray-650 mt-0.5">
              RECIBO
            </h3>
            
            {/* Aligned Right Nucleo */}
            <div className="absolute top-1 right-2 text-right font-sans text-[10px]">
              <span className="font-bold text-stone-900 block bg-gray-100 border border-gray-250 px-2 py-0.5 rounded">
                Núcleo: {rcb.nomeNucleo}
              </span>
            </div>
          </div>

          {/* Valor Banner Row */}
          <div className="text-xs font-sans flex flex-wrap items-center mt-2 leading-loose gap-2 border-b border-dashed border-gray-350 pb-1.5">
            <span className="font-bold">Valor R$</span>
            <span className="border border-gray-300 font-extrabold px-6 py-0.5 bg-gray-50 rounded text-xs font-sans leading-none inline-block tracking-widest min-w-[140px] text-center">
              _________________________
            </span>
            <span className="text-gray-400 font-normal">---------------------------------------------------------</span>
          </div>

          {/* Extensive value spelled out */}
          <p className="text-xs leading-relaxed italic text-stone-850 pb-1.5 border-b border-gray-100 font-sans">
            ( __________________________________________________________________________________________ )
          </p>

          {/* Contextual Description text in center/justify */}
          <div className="leading-relaxed text-justify text-xs pt-0.5">
            <p className="indent-8 text-justify leading-relaxed">
              Recebi, da <strong>{schoolSettings.nome}</strong> (CNPJ <strong>{schoolSettings.cnpj}</strong>), a importância acima, referente a <span className="underline font-bold text-slate-950">{rcb.referente}</span>.
            </p>
          </div>

          {/* Date and Details Grid */}
          <div className="pt-1 flex flex-col md:flex-row justify-between items-start md:items-end gap-2 font-sans">
            {/* Left details */}
            <div className="text-[11px] space-y-0.5 my-1 text-left">
              <div><strong>CPF:</strong> <span className="font-mono">{rcb.cpfProfessor || "-"}</span></div>
              <div><strong>Nome:</strong> <span className="font-bold">{rcb.nomeProfessor}</span></div>
              {rcb.disciplina && (
                <div><strong>Disciplina / Matéria:</strong> <span className="font-bold text-stone-900 bg-amber-50/50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] inline-block">{rcb.disciplina}</span></div>
              )}
              <div><strong>Endereço:</strong> <span className="text-gray-750">{rcb.enderecoProfessor}</span></div>
            </div>

            {/* Right Date */}
            <div className="text-right text-xs shrink-0 font-medium pb-0.5">
              <strong>Data:</strong> <span className="underline font-bold">
                {new Date(rcb.data + "T12:00:00").toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).replace(/\//g, " / ")}
              </span>
            </div>
          </div>

          {/* Single Signature Line (Unified) */}
          <div className="pt-3 pb-1 text-left font-sans">
            <div className="w-full max-w-lg border-b border-stone-405 text-xs text-slate-650 block pt-1 pb-1">
              <strong>Assinatura do Recebedor / Professor:</strong> ____________________________________________
            </div>
          </div>

          {/* Centered Institutional Footer */}
          <div className="pt-2 border-t border-slate-200 text-center font-sans text-[8px] text-slate-500 leading-normal">
            <div className="font-bold text-slate-700">{schoolSettings.nome}</div>
            <div>{schoolSettings.endereco} | Fone: {schoolSettings.telefone} | {schoolSettings.email}</div>
          </div>
        </div>
      );
    }

    if (rcb.template === "tesouraria") {
      return (
        <div className="space-y-3.5 text-black font-sans text-left">
          {/* Centered Logo & Brand with a distinctive background banner */}
          <div className="flex items-center justify-between border-b border-gray-350 pb-1.5">
            <div className="flex items-center space-x-3">
              <img 
                src={schoolSettings.logoUrl || defaultSchoolLogo} 
                alt="ESTEADEB" 
                className="w-12 h-12 object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <h2 className="text-sm font-bold tracking-tight uppercase text-neutral-900 leading-tight">
                  {schoolSettings.nome}
                </h2>
                <div className="text-[8px] font-sans text-stone-500 font-semibold uppercase tracking-wider">
                  TESOURARIA CENTRAL &amp; CONTABILIDADE
                </div>
                <div className="text-[8px] font-bold text-gray-500">CNPJ: {schoolSettings.cnpj}</div>
              </div>
            </div>
            
            <div className="text-right font-sans text-xs shrink-0">
              <div className="font-bold text-stone-900 block bg-amber-50 border border-amber-300/60 px-2 py-0.5 rounded text-[10px]">
                Núcleo: {rcb.nomeNucleo}
              </div>
              <div className="text-[8px] text-gray-500 mt-0.5">Curso: {rcb.cursoNucleo}</div>
            </div>
          </div>

          <div className="text-center py-1 bg-neutral-900 text-white rounded font-sans tracking-widest text-[11px] font-bold uppercase">
            RECIBO DE TESOURARIA / CAIXA
          </div>

          {/* Amount details banner style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-1 bg-gray-50 p-2 rounded border border-gray-350 flex flex-col justify-center">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 block font-bold">Valor do Recibo</span>
              <span className="font-extrabold text-sm text-stone-900">
                {rcb.valor > 0 ? formatCurrency(rcb.valor) : "R$ ____________"}
              </span>
            </div>

            <div className="md:col-span-2 bg-gray-50 p-2 rounded border border-gray-350">
              <span className="text-[8px] uppercase tracking-wider text-gray-400 block font-bold">Importância por Extenso</span>
              <span className="text-[10px] text-stone-850 font-medium italic block leading-relaxed pt-0.5">
                ( {rcb.valorExtenso || "____________________________________________________________"} )
              </span>
            </div>
          </div>

          {/* Description text */}
          <div className="leading-relaxed text-stone-900 text-justify text-xs space-y-1.5 pt-1">
            <p className="leading-relaxed text-justify">
              Recebemos do(a) favorecido(a) <strong>{rcb.nomeProfessor}</strong>, inscrito no CPF sob o nº <strong>{rcb.cpfProfessor || "___.___.___-__"}</strong> e residente no endereço <strong>{rcb.enderecoProfessor || "Não informado"}</strong>, a importância descrita neste comprovante, correspondente a: <span className="underline font-bold text-neutral-900">{rcb.referente}</span>.
            </p>
          </div>

          {/* Payment Method checkboxes & Discipline */}
          <div className="border border-gray-200 rounded p-2 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[8px] uppercase tracking-wider text-gray-400 block font-bold mb-1">Forma de Pagamento</span>
              <div className="flex flex-wrap gap-3 text-[10px] text-stone-850 font-medium">
                <label className="flex items-center space-x-1">
                  <input type="checkbox" readOnly checked={rcb.valor > 0} className="w-3.5 h-3.5 accent-neutral-900" />
                  <span>PIX / Transf.</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input type="checkbox" className="w-3.5 h-3.5" />
                  <span>Dinheiro</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input type="checkbox" className="w-3.5 h-3.5" />
                  <span>Cheque / Outros</span>
                </label>
              </div>
            </div>

            {rcb.disciplina ? (
              <div className="text-right text-[10.5px]">
                <span className="text-[7.5px] uppercase tracking-wider text-stone-400 block font-bold leading-none mb-0.5">Disciplina Relacionada</span>
                <span className="font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[9.5px] inline-block">{rcb.disciplina}</span>
              </div>
            ) : (
              <div className="text-right text-[10.5px]">
                <span className="text-[7.5px] uppercase tracking-wider text-stone-400 block font-bold leading-none mb-0.5">Disciplina / Matéria</span>
                <span className="text-gray-400 italic text-[9.5px]">[Não atribuída]</span>
              </div>
            )}
          </div>

          {/* Date row */}
          <div className="pt-0.5 text-right font-sans text-xs">
            <span>Data: </span> 
            <strong className="underline">
              {new Date(rcb.data + "T12:00:00").toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </strong>
          </div>

          {/* Two-Column Signatures signature Box */}
          <div className="grid grid-cols-2 gap-4 text-center items-end pt-3 font-sans">
            <div className="p-2 border border-dashed border-gray-300 rounded bg-stone-50/50">
              <div className="h-4"></div>
              <div className="border-t border-gray-400 pt-0.5 text-[8px] text-gray-500 font-bold uppercase tracking-wider">
                Visto do Tesoureiro / Caixa
              </div>
            </div>
            <div className="p-2 border border-dashed border-gray-300 rounded bg-stone-50/50">
              <div className="h-4"></div>
              <div className="border-t border-gray-400 pt-0.5 text-[8px] text-gray-500 font-bold uppercase tracking-wider font-sans">
                Assinatura do Recebedor / Professor
              </div>
            </div>
          </div>

          {/* Footer small text */}
          <div className="pt-2 border-t border-gray-200 text-center font-sans text-[8px] text-gray-550 leading-normal">
            <div>{schoolSettings.nome}</div>
            <div>{schoolSettings.endereco} | Fone: {schoolSettings.telefone} | {schoolSettings.email}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 text-black">
        {/* Logo and Header info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={schoolSettings.logoUrl || defaultSchoolLogo} 
              alt="ESTEADEB Shield" 
              className="w-13 h-13 object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-base font-bold tracking-tight uppercase font-sans text-stone-900" style={{ fontSize: "11.5pt" }}>
                {schoolSettings.nome}
              </h2>
              <span className="text-[8px] font-sans text-stone-550 font-semibold uppercase tracking-widest leading-none block">Escola Teológica Oficial</span>
              <div className="text-[9.5px] font-sans font-bold mt-0.5 text-stone-700">CNPJ: {schoolSettings.cnpj}</div>
            </div>
          </div>

          {/* Corner right side */}
          <div className="text-right font-sans text-[10px] space-y-0.5">
            <div className="bg-gray-100 px-2 py-0.5 rounded font-bold border border-gray-300 text-stone-900">
              Núcleo: <span>{rcb.nomeNucleo}</span>
            </div>
            <div className="text-[8.5px] text-gray-650 font-medium">Curso: {rcb.cursoNucleo}</div>
            {rcb.disciplina && (
              <div className="text-[8.5px] text-amber-800 font-bold">Disciplina: {rcb.disciplina}</div>
            )}
          </div>
        </div>

        {/* Main Receipt Subtitle text */}
        <div className="text-center py-1.5 border-y border-stone-250 font-sans">
          <h3 className="text-lg font-bold tracking-widest text-stone-900 leading-none">RECIBO DE PAGAMENTO</h3>
        </div>

        {/* Amount details banner */}
        <div className="bg-gray-50 p-2 rounded-lg border border-gray-250 flex items-center justify-between font-sans">
          <span className="font-bold text-stone-600 text-[10.5px]">VALOR LÍQUIDO ADIANTADO:</span>
          <div className="font-extrabold text-base text-stone-950 bg-white border border-gray-350 px-4 py-0.5 rounded">
            {formatCurrency(rcb.valor)}
          </div>
        </div>

        {/* Extensive representation sentence */}
        {rcb.valorExtenso && (
          <p className="text-xs italic text-stone-880 leading-normal font-sans italic text-left">
            ( {rcb.valorExtenso} )
          </p>
        )}

        {/* Contract contextual description */}
        <div className="leading-relaxed text-stone-900 text-justify text-xs space-y-1">
          <p className="text-justify leading-relaxed">
            Recebi, da entidade de ensino superior eclesiástico <strong>{schoolSettings.nome}</strong>, cadastrada no CNPJ sob o nº <strong>{schoolSettings.cnpj}</strong>, a importância líquida mencionada acima, referente a: <span className="underline font-bold text-stone-950">{rcb.referente}</span>.
          </p>
        </div>

        {/* Date Emit */}
        <div className="pt-0.5 text-right font-sans text-xs">
          <span>Data: </span> 
          <strong className="underline">
            {new Date(rcb.data + "T12:00:00").toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </strong>
        </div>

        {/* Recipient registration items */}
        <div className="bg-gray-100 p-2.5 rounded font-sans grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[10.5px] border border-gray-200">
          <div className="text-left">
            <strong className="text-gray-500 text-[7.5px] uppercase tracking-wider block font-bold">Professor / Favorecido</strong>
            <span className="font-bold text-stone-900 block text-xs">{rcb.nomeProfessor}</span>
          </div>
          <div className="text-left">
            <strong className="text-gray-500 text-[7.5px] uppercase tracking-wider block font-bold">Documento CPF</strong>
            <span className="font-mono text-stone-850 font-semibold">{rcb.cpfProfessor}</span>
          </div>
          {rcb.disciplina && (
            <div className="md:col-span-2 text-left bg-amber-50/40 p-1.5 rounded border border-amber-200/50">
              <strong className="text-amber-800 text-[7.5px] uppercase tracking-wider block font-bold">Disciplina / Matéria</strong>
              <span className="font-bold text-amber-950 text-xs">{rcb.disciplina}</span>
            </div>
          )}
          <div className="md:col-span-2 text-left">
            <strong className="text-gray-500 text-[7.5px] uppercase tracking-wider block font-bold">Endereço Residencial</strong>
            <span className="text-stone-750 font-normal">{rcb.enderecoProfessor}</span>
          </div>
        </div>

        {/* Single signature box centered */}
        <div className="pt-3.5 flex justify-center font-sans">
          <div className="w-full max-w-sm p-2 rounded border border-dashed border-gray-300 bg-white text-center">
            <div className="h-5"></div>
            <div className="border-t border-gray-400 pt-1 text-[8.5px] text-gray-500 font-bold uppercase tracking-wider">
              Assinatura do Recebedor / Professor
            </div>
          </div>
        </div>

        {/* Footer small text */}
        <div className="pt-2 border-t border-gray-200 text-center font-sans text-[8px] text-gray-550 leading-normal">
          <div>{schoolSettings.nome}</div>
          <div>{schoolSettings.endereco} | Fone: {schoolSettings.telefone} | {schoolSettings.email}</div>
        </div>
      </div>
    );
  };

  // Teachers State & CRUD Forms
  const [teacherSearch, setTeacherSearch] = useState<string>("");
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);
  const [editingTeacher, setEditingTeacher] = useState<Professor | null>(null);
  const [teacherForm, setTeacherForm] = useState<Omit<Professor, "id">>({
    nome: "",
    cpf: "",
    endereco: "",
    bairro: "",
    cidadeUf: "Natal/RN",
    cep: "",
    telefone: "",
    email: "",
    dadosBancarios: "",
    observacoes: "",
    whatsapp: "",
    aniversario: "",
    congregacao: "",
    nivelFormacao: "",
    nomeCurso: "",
    instituicaoFormacao: "",
    anoConclusao: "",
    chavePix: "",
    banco: "",
    tipoConta: "",
    operacao: "",
    agencia: "",
    conta: ""
  });

  // Nuclei State & CRUD Forms
  const [nucleusSearch, setNucleusSearch] = useState<string>("");
  const [isNucleusModalOpen, setIsNucleusModalOpen] = useState<boolean>(false);
  const [editingNucleus, setEditingNucleus] = useState<Nucleo | null>(null);
  const [nucleusForm, setNucleusForm] = useState<Omit<Nucleo, "id">>({
    nome: "",
    curso: "Médio em Teologia",
    cidade: "Natal",
    coordenador: "",
    observacoes: ""
  });

  // Receipts Generation State
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedNucleusId, setSelectedNucleusId] = useState<string>("");
  const [receiptDate, setReceiptDate] = useState<string>(() => {
    const today = new Date();
    // Format YYYY-MM-DD
    return today.toISOString().split("T")[0];
  });
  const [receiptValueInput, setReceiptValueInput] = useState<string>("");
  const [receiptValueExtenso, setReceiptValueExtenso] = useState<string>("");
  const [receiptReferente, setReceiptReferente] = useState<string>("");
  const [printLayoutConfig, setPrintLayoutConfig] = useState<"1_via" | "2_vias">("2_vias");
  const [receiptTemplate, setReceiptTemplate] = useState<"docente" | "coordenador_secretario" | "tesouraria">("docente");
  const [receiptDisciplina, setReceiptDisciplina] = useState<string>("");

  // Selection auto-fills
  useEffect(() => {
    const teacher = teachers.find(t => t.id === selectedTeacherId);
    const nucleus = nuclei.find(n => n.id === selectedNucleusId);

    if (teacher && nucleus) {
      if (receiptTemplate === "coordenador_secretario") {
        setReceiptReferente("comissão de secretário no núcleo supracitado.");
      } else if (receiptTemplate === "tesouraria") {
        setReceiptReferente("reembolso de despesas, apoio logístico e atendimento administrativo de Tesouraria.");
      } else {
        // Dynamic standard text
        const cleanCurso = nucleus.curso || "[CURSO]";
        const cleanNucleo = nucleus.nome || "[NUCLEO]";
        if (receiptDisciplina.trim()) {
          setReceiptReferente(`aulas ministradas sobre a disciplina ${receiptDisciplina.trim()} referente ao curso ${cleanCurso} no Núcleo ${cleanNucleo} da ESTEADEB`);
        } else {
          setReceiptReferente(`aulas ministradas referente ao curso ${cleanCurso} no Núcleo ${cleanNucleo} da ESTEADEB`);
        }
      }
    } else if (teacher) {
      if (receiptTemplate === "coordenador_secretario") {
        setReceiptReferente("comissão de secretário no núcleo supracitado.");
      } else if (receiptTemplate === "tesouraria") {
        setReceiptReferente("reembolso de despesas, apoio logístico e atendimento administrativo de Tesouraria.");
      } else {
        setReceiptReferente(`serviços educacionais prestados à ESTEADEB.`);
      }
    }
  }, [selectedTeacherId, selectedNucleusId, teachers, nuclei, receiptTemplate, receiptDisciplina]);

  // Number to Words synchronization
  const handleValueChange = (valStr: string) => {
    // replace commas for dots to parse correctly
    const cleanStr = valStr.replace(",", ".");
    setReceiptValueInput(valStr);
    
    if (cleanStr && !isNaN(Number(cleanStr))) {
      const num = Number(cleanStr);
      if (num >= 0) {
        setReceiptValueExtenso(numeroParaExtenso(num));
      } else {
        setReceiptValueExtenso("");
      }
    } else {
      setReceiptValueExtenso("");
    }
  };

  // Live Receipt Preview Overlay
  const [previewReceipt, setPreviewReceipt] = useState<Recibo | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // History state
  const [historySearch, setHistorySearch] = useState<string>("");

  // Default Image Representation helper - elegant circular shield (SVG converted to DataURL)
  const defaultSchoolLogo = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="%231e3a8a" stroke="%23f59e0b" stroke-width="3"/><circle cx="50" cy="50" r="41" fill="%231e3a8a" stroke="%23ffffff" stroke-width="1"/><path d="M50 18 L50 78 M32 38 L68 38" stroke="%23f59e0b" stroke-width="5" stroke-linecap="round"/><path d="M30 63 Q50 56 70 63 L70 70 Q50 63 30 70 Z" fill="%23ffffff" stroke="%23f59e0b" stroke-width="1.5"/><path d="M50 60 L50 69" stroke="%231e3a8a" stroke-width="1"/></svg>`;

  // Handle Logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolSettings(prev => ({
          ...prev,
          logoUrl: reader.result as string
        }));
        triggerNotification("Logo da escola atualizada com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setSchoolSettings(prev => ({
      ...prev,
      logoUrl: undefined
    }));
    triggerNotification("Logo restaurada para o padrão institucional.");
  };

  // JSON export & import
  const exportBackup = () => {
    const fullData = {
      teachers,
      nuclei,
      receipts,
      schoolSettings
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(fullData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `Backup_SIGTEO_Recibos_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerNotification("Backup dos dados realizado com sucesso!");
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.teachers && parsed.nuclei && parsed.receipts && parsed.schoolSettings) {
            setTeachers(parsed.teachers);
            setNuclei(parsed.nuclei);
            setReceipts(parsed.receipts);
            setSchoolSettings(parsed.schoolSettings);
            triggerNotification("Dados importados com sucesso!", "success");
          } else {
            triggerNotification("Formato de backup inválido!", "error");
          }
        } catch (error) {
          triggerNotification("Erro ao processar arquivo JSON.", "error");
        }
      };
      reader.readAsText(file);
    }
    // Clear value to allow re-upload
    e.target.value = "";
  };

  const clearAllDataConfirm = () => {
    showConfirm({
      title: "Excluir Todos os Dados",
      message: "Deseja realmente apagar TODOS os professores, núcleos e histórico de recibos? Esta ação é irreversível!",
      confirmText: "Sim, Excluir Tudo",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: () => {
        setTeachers([]);
        setNuclei([]);
        setReceipts([]);
        setSchoolSettings(INITIAL_SCHOOL);
        localStorage.removeItem("esteadeb_teachers");
        localStorage.removeItem("esteadeb_nuclei");
        localStorage.removeItem("esteadeb_receipts");
        localStorage.removeItem("esteadeb_school");
        triggerNotification("Todos os registros foram excluídos. O sistema foi redefinido.", "info");
      }
    });
  };

  const setupDefaultMockData = () => {
    showConfirm({
      title: "Restaurar Registros de Demonstração",
      message: "Deseja restaurar os registros de demonstração da escola?",
      confirmText: "Restaurar",
      cancelText: "Cancelar",
      variant: "primary",
      onConfirm: () => {
        setTeachers(INITIAL_TEACHERS);
        setNuclei(INITIAL_NUCLEI);
        setSchoolSettings(INITIAL_SCHOOL);
        setReceipts(INITIAL_RECEIPTS);
        triggerNotification("Registros de demonstração carregados com sucesso!");
      }
    });
  };

  // CRUD handlers - TEACHERS
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.nome || !teacherForm.cpf) {
      triggerNotification("Nome Completo e CPF são obrigatórios", "error");
      return;
    }

    if (editingTeacher) {
      // Edit
      setTeachers(prev => 
        prev.map(t => t.id === editingTeacher.id ? { ...t, ...teacherForm } : t)
      );
      triggerNotification("Professor atualizado com sucesso!");
    } else {
      // Create
      const newTeacher: Professor = {
        id: `prof_${Date.now()}`,
        ...teacherForm
      };
      setTeachers(prev => [newTeacher, ...prev]);
      triggerNotification("Professor cadastrado com sucesso!");
    }

    // Reset Form & Close
    setTeacherForm({
      nome: "",
      cpf: "",
      endereco: "",
      bairro: "",
      cidadeUf: "Natal/RN",
      cep: "",
      telefone: "",
      email: "",
      dadosBancarios: "",
      observacoes: "",
      whatsapp: "",
      aniversario: "",
      congregacao: "",
      nivelFormacao: "",
      nomeCurso: "",
      instituicaoFormacao: "",
      anoConclusao: "",
      chavePix: "",
      banco: "",
      tipoConta: "",
      operacao: "",
      agencia: "",
      conta: ""
    });
    setEditingTeacher(null);
    setIsTeacherModalOpen(false);
  };

  const startEditTeacher = (teacher: Professor) => {
    setEditingTeacher(teacher);
    setTeacherForm({
      nome: teacher.nome,
      cpf: teacher.cpf,
      endereco: teacher.endereco,
      bairro: teacher.bairro,
      cidadeUf: teacher.cidadeUf,
      cep: teacher.cep,
      telefone: teacher.telefone,
      email: teacher.email,
      dadosBancarios: teacher.dadosBancarios || "",
      observacoes: teacher.observacoes || "",
      whatsapp: teacher.whatsapp || "",
      aniversario: teacher.aniversario || "",
      congregacao: teacher.congregacao || "",
      nivelFormacao: teacher.nivelFormacao || "",
      nomeCurso: teacher.nomeCurso || "",
      instituicaoFormacao: teacher.instituicaoFormacao || "",
      anoConclusao: teacher.anoConclusao || "",
      chavePix: teacher.chavePix || "",
      banco: teacher.banco || "",
      tipoConta: teacher.tipoConta || "",
      operacao: teacher.operacao || "",
      agencia: teacher.agencia || "",
      conta: teacher.conta || ""
    });
    setIsTeacherModalOpen(true);
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    showConfirm({
      title: "Remover Professor(a)",
      message: `Deseja realmente remover o(a) professor(a) "${name}"? Isso não apagará recibos antigos vinculados a ele(a).`,
      confirmText: "Excluir Professor",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: () => {
        setTeachers(prev => prev.filter(t => t.id !== id));
        triggerNotification("Professor removido do cadastro.");
      }
    });
  };

  const exportTeachersToExcel = () => {
    if (teachers.length === 0) {
      triggerNotification("Não há professores cadastrados para exportar.", "error");
      return;
    }

    try {
      const excelData = teachers.map(t => ({
        "Nome": t.nome || "",
        "Whatsapp": t.whatsapp || t.telefone || "",
        "CPF": t.cpf || "",
        "Data Aniversário (Dia/Mês)": t.aniversario || "",
        "Endereço": t.endereco || "",
        "Congregação": t.congregacao || "",
        "Nível de Formação": t.nivelFormacao || "",
        "Nome do Curso": t.nomeCurso || "",
        "Instituição de Formação": t.instituicaoFormacao || "",
        "Ano Conclusão": t.anoConclusao || "",
        "Chave PIX": t.chavePix || "",
        "Banco": t.banco || "",
        "Tipo Conta": t.tipoConta || "",
        "Operação": t.operacao || "",
        "Agencia": t.agencia || "",
        "Conta": t.conta || ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Professores");

      XLSX.writeFile(workbook, "ESTEADEB_Professores.xlsx");
      triggerNotification("Planilha Excel exportada com sucesso!");
    } catch (e) {
      console.error(e);
      triggerNotification("Erro ao gerar o arquivo Excel.", "error");
    }
  };

  const downloadExcelTemplate = () => {
    try {
      const templateData = [
        {
          "Nome": "Maria Oliveira de Souza",
          "Whatsapp": "(84) 99876-5432",
          "CPF": "123.456.789-00",
          "Data Aniversário (Dia/Mês)": "15/04",
          "Endereço": "Rua das Flores, 123",
          "Bairro": "Lagoa Nova",
          "Cidade / UF": "Natal/RN",
          "CEP": "59000-000",
          "Congregação": "Sede",
          "Nível de Formação": "Mestrado",
          "Nome do Curso": "Teologia Sistemática",
          "Instituição de Formação": "FATESTE",
          "Ano Conclusão": "2022",
          "Chave PIX": "12345678900",
          "Banco": "Banco do Brasil",
          "Tipo Conta": "Corrente",
          "Operação": "",
          "Agencia": "1234-5",
          "Conta": "98765-4",
          "E-mail": "maria.souza@esteadeb.org.br",
          "Dados Bancários": "Ag: 1234-5 Conta: 98765-4 - BB",
          "Observações": "Professora de Homilética e Hermenêutica."
        },
        {
          "Nome": "João Silva Fernandes",
          "Whatsapp": "(84) 99123-4567",
          "CPF": "987.654.321-99",
          "Data Aniversário (Dia/Mês)": "30/10",
          "Endereço": "Av. Hermes da Fonseca, 456",
          "Bairro": "Petrópolis",
          "Cidade / UF": "Natal/RN",
          "CEP": "59020-000",
          "Congregação": "Templo Central",
          "Nível de Formação": "Doutorado",
          "Nome do Curso": "Divindade e História",
          "Instituição de Formação": "ESTEADEB",
          "Ano Conclusão": "2020",
          "Chave PIX": "98765432199",
          "Banco": "Caixa Econômica",
          "Tipo Conta": "Poupança",
          "Operação": "013",
          "Agencia": "0560",
          "Conta": "00012345-6",
          "E-mail": "joao.fernandes@esteadeb.org.br",
          "Dados Bancários": "Ag: 0560 Op: 013 Conta: 12345-6 - CEF",
          "Observações": "Supervisor de Estudos Bíblicos."
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo_Docentes");

      XLSX.writeFile(workbook, "ESTEADEB_Modelo_Importacao.xlsx");
      triggerNotification("Modelo de planilha para importação baixado com sucesso!");
    } catch (e) {
      console.error(e);
      triggerNotification("Erro ao gerar o modelo de planilha.", "error");
    }
  };

  const importTeachersFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          triggerNotification("Nenhuma aba encontrada na planilha.", "error");
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (jsonData.length === 0) {
          triggerNotification("Planilha vazia ou sem dados válidos.", "error");
          return;
        }

        let importedCount = 0;
        let updatedCount = 0;
        const updatedTeachers = [...teachers];

        jsonData.forEach((row: any) => {
          const nome = String(row["Nome"] || row["nome"] || "").trim();
          if (!nome) return; // Skip rows with no name

          const rawCpf = String(row["CPF"] || row["cpf"] || "").trim();
          const cpf = rawCpf === "undefined" ? "" : rawCpf;

          const whatsapp = String(row["WhatsApp"] || row["Whatsapp"] || row["whatsapp"] || "").trim();
          const telephone = String(row["Telefone"] || row["telefone"] || row["Celular"] || "").trim();
          const telefoneValue = telephone || whatsapp || "(84) 99999-9999";

          const aniversario = String(row["Data Aniversário (Dia/Mês)"] || row["Aniversário"] || row["aniversario"] || "").trim();
          const endereco = String(row["Endereço"] || row["endereco"] || row["Rua"] || "").trim();
          const congregacao = String(row["Congregação"] || row["congregacao"] || "").trim();
          
          const nivelFormacao = String(row["Nível de Formação"] || row["Nível de formação"] || row["Formação"] || row["nivelFormacao"] || "").trim();
          const nomeCurso = String(row["Nome do Curso"] || row["Nome do curso"] || row["Curso"] || row["nomeCurso"] || "").trim();
          const instituicaoFormacao = String(row["Instituição de Formação"] || row["Instituição"] || "").trim();
          const anoConclusao = String(row["Ano Conclusão"] || row["Ano conclusão"] || row["Conclusão"] || "").trim();
          
          const chavePix = String(row["Chave PIX"] || row["Chave Pix"] || row["Pix"] || row["chavePix"] || "").trim();
          const banco = String(row["Banco"] || row["banco"] || "").trim();
          const tipoConta = String(row["Tipo Conta"] || row["Tipo conta"] || row["tipoConta"] || "").trim();
          const operacao = String(row["Operação"] || row["operacao"] || "").trim();
          const agencia = String(row["Agencia"] || row["Agência"] || row["agencia"] || "").trim();
          const conta = String(row["Conta"] || row["conta"] || "").trim();
          const email = String(row["E-mail"] || row["Email"] || row["email"] || "").trim() || `${nome.toLowerCase().replace(/[^a-z0-9]/g, "")}@esteadeb.org.br`;

          // Look for an existing teacher by CPF (if present and valid) or exactly by name
          let existingIndex = -1;
          if (cpf && cpf !== "" && cpf !== "-") {
            existingIndex = updatedTeachers.findIndex(t => t.cpf === cpf);
          } else {
            existingIndex = updatedTeachers.findIndex(t => t.nome.toLowerCase().trim() === nome.toLowerCase().trim());
          }

          const teacherData: Professor = {
            id: existingIndex >= 0 ? updatedTeachers[existingIndex].id : "prof_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            nome,
            cpf,
            endereco: endereco || "Endereço não informado",
            bairro: String(row["Bairro"] || "").trim() || "Centro",
            cidadeUf: String(row["Cidade / UF"] || row["Cidade"] || "").trim() || "Natal/RN",
            cep: String(row["CEP"] || row["cep"] || "").trim() || "59000-000",
            telefone: telefoneValue,
            email,
            dadosBancarios: String(row["Descrição Adicional de Pagamento"] || row["Dados Bancários"] || "").trim(),
            observacoes: String(row["Observações"] || row["observacoes"] || "").trim(),
            whatsapp: whatsapp || telefoneValue,
            aniversario,
            congregacao,
            nivelFormacao,
            nomeCurso,
            instituicaoFormacao,
            anoConclusao,
            chavePix,
            banco,
            tipoConta,
            operacao,
            agencia,
            conta
          };

          if (existingIndex >= 0) {
            updatedTeachers[existingIndex] = teacherData;
            updatedCount++;
          } else {
            updatedTeachers.push(teacherData);
            importedCount++;
          }
        });

        setTeachers(updatedTeachers);
        triggerNotification(`Sucesso: ${importedCount} novos docentes adicionados e ${updatedCount} atualizados.`);
      } catch (err) {
        console.error(err);
        triggerNotification("Erro ao processar as colunas da planilha.", "error");
      }
    };
    reader.onerror = () => {
      triggerNotification("Erro ao ler o arquivo excel.", "error");
    };
    reader.readAsArrayBuffer(file);

    // Reset standard target value to allow same spreadsheet import again
    e.target.value = "";
  };

  // CRUD handlers - NUCLEI
  const handleSaveNucleus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nucleusForm.nome || !nucleusForm.coordenador) {
      triggerNotification("Nome do Núcleo e Coordenador são obrigatórios", "error");
      return;
    }

    if (editingNucleus) {
      setNuclei(prev => 
        prev.map(n => n.id === editingNucleus.id ? { ...n, ...nucleusForm } : n)
      );
      triggerNotification("Núcleo de ensino atualizado!");
    } else {
      const newNucleus: Nucleo = {
        id: `nuc_${Date.now()}`,
        ...nucleusForm
      };
      setNuclei(prev => [newNucleus, ...prev]);
      triggerNotification("Núcleo cadastrado com sucesso!");
    }

    setNucleusForm({
      nome: "",
      curso: "Médio em Teologia",
      cidade: "Natal",
      coordenador: "",
      observacoes: ""
    });
    setEditingNucleus(null);
    setIsNucleusModalOpen(false);
  };

  const startEditNucleus = (nuc: Nucleo) => {
    setEditingNucleus(nuc);
    setNucleusForm({
      nome: nuc.nome,
      curso: nuc.curso,
      cidade: nuc.cidade,
      coordenador: nuc.coordenador,
      observacoes: nuc.observacoes || ""
    });
    setIsNucleusModalOpen(true);
  };

  const handleDeleteNucleus = (id: string, name: string) => {
    showConfirm({
      title: "Remover Núcleo de Ensino",
      message: `Deseja realmente remover o núcleo "${name}"?`,
      confirmText: "Excluir Núcleo",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: () => {
        setNuclei(prev => prev.filter(n => n.id !== id));
        triggerNotification("Núcleo removido com sucesso.");
      }
    });
  };

  // RECEIPT GENERATION & TRIGGER PRINT PROCESS
  // Ref containing content formatted for standard browser print dialog
  const printSectionRef = useRef<HTMLDivElement>(null);
  const [selectedReceiptIds, setSelectedReceiptIds] = useState<string[]>([]);
  const [printData, setPrintData] = useState<{
    recibo?: Recibo;
    recibosList?: Recibo[];
    school: ConfiguracoesEscola;
    vias?: "1_via" | "2_vias";
  } | null>(null);

  const handleGenerateReceipt = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeacherId) {
      triggerNotification("Por favor, selecione um Professor", "error");
      return;
    }
    if (!selectedNucleusId) {
      triggerNotification("Por favor, selecione um Núcleo", "error");
      return;
    }
    const canBeBlank = receiptTemplate === "coordenador_secretario" || receiptTemplate === "tesouraria";
    if (!canBeBlank) {
      if (!receiptValueInput || Number(receiptValueInput.replace(",", ".")) <= 0) {
        triggerNotification("Informe um Valor de pagamento válido", "error");
        return;
      }
    }
    if (!receiptDate) {
      triggerNotification("Selecione a Data do recibo", "error");
      return;
    }
    if (!receiptReferente.trim()) {
      triggerNotification("Preencha a especificação referente ao pagamento", "error");
      return;
    }

    const teacher = teachers.find(t => t.id === selectedTeacherId)!;
    const nucleus = nuclei.find(n => n.id === selectedNucleusId)!;
    const valorNum = (!receiptValueInput) ? 0 : Number(receiptValueInput.replace(",", "."));
    const valorExtensoStr = (receiptTemplate === "coordenador_secretario" || !receiptValueInput) ? "" : receiptValueExtenso;

    const newRecibo: Recibo = {
      id: `rec_${Date.now()}`,
      idProfessor: teacher.id,
      nomeProfessor: teacher.nome,
      cpfProfessor: teacher.cpf,
      enderecoProfessor: `${teacher.endereco}, Bairro ${teacher.bairro}, ${teacher.cidadeUf}`,
      idNucleo: nucleus.id,
      nomeNucleo: nucleus.nome,
      cursoNucleo: nucleus.curso,
      data: receiptDate,
      valor: valorNum,
      valorExtenso: valorExtensoStr,
      referente: receiptReferente,
      duasVias: printLayoutConfig === "2_vias",
      dataCriacao: new Date().toISOString(),
      template: receiptTemplate,
      disciplina: receiptDisciplina.trim() || undefined
    };

    // Save in history list
    setReceipts(prev => [newRecibo, ...prev]);

    // Define print state
    setPrintData({
      recibo: newRecibo,
      school: schoolSettings,
      vias: printLayoutConfig
    });

    triggerNotification("Recibo gerado e registrado no histórico!", "success");

    // Launch print layout action shortly to let state render
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Preview an existing receipt from table
  const handlePreviewReceipt = (receipt: Recibo) => {
    setPreviewReceipt(receipt);
    setIsPreviewModalOpen(true);
  };

  // Print single historical receipt directly
  const handlePrintExistingReceipt = (receipt: Recibo) => {
    setPrintData({
      recibo: receipt,
      school: schoolSettings,
      vias: receipt.duasVias ? "2_vias" : "1_via"
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Print all selected receipts from checklist (2 per page)
  const handlePrintSelectedReceipts = () => {
    if (selectedReceiptIds.length === 0) {
      triggerNotification("Selecione pelo menos um recibo para imprimir.", "error");
      return;
    }
    const matchingReceipts = receipts.filter(r => selectedReceiptIds.includes(r.id));
    if (matchingReceipts.length === 0) {
      triggerNotification("Nenhum recibo correspondente encontrado.", "error");
      return;
    }

    setPrintData({
      recibosList: matchingReceipts,
      school: schoolSettings
    });

    setTimeout(() => {
      window.print();
    }, 180);
  };

  // Delete historical receipt row
  const handleDeleteReceipt = (id: string) => {
    showConfirm({
      title: "Excluir Recibo do Histórico",
      message: "Deseja realmente deletar este recibo permanentemente do histórico?",
      confirmText: "Excluir Recibo",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: () => {
        setReceipts(prev => prev.filter(r => r.id !== id));
        triggerNotification("Recibo removido do histórico.", "info");
      }
    });
  };

  // Calculators/Stats
  const totalTeachers = teachers.length;
  const totalNuclei = nuclei.length;
  const totalReceiptsCount = receipts.length;

  const totalPaidCurrentMonth = (() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    // 0-indexed month, but let's make a safe string match
    const currentMonthPrefix = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    return receipts
      .filter(r => r.data.startsWith(currentMonthPrefix))
      .reduce((sum, r) => sum + r.valor, 0);
  })();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  // Search filter listings
  const filteredTeachers = teachers.filter(t => 
    t.nome.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    t.cpf.replace(/[.-]/g, "").includes(teacherSearch)
  );

  const filteredNuclei = nuclei.filter(n => 
    n.nome.toLowerCase().includes(nucleusSearch.toLowerCase()) ||
    n.coordenador.toLowerCase().includes(nucleusSearch.toLowerCase())
  );

  const filteredReceipts = receipts.filter(r => 
    r.nomeProfessor.toLowerCase().includes(historySearch.toLowerCase()) ||
    r.nomeNucleo.toLowerCase().includes(historySearch.toLowerCase()) ||
    r.data.includes(historySearch)
  );

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans print:bg-white text-slate-800">
      
      {/* HEADER BAR (Visible on screen, Hidden on printing) */}
      <header className="bg-admin-navy border-b-2 border-admin-gold text-white shadow-md select-none print:hidden font-sans">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 xl:px-12 h-18 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="p-1.5 bg-admin-gold-light rounded-full flex items-center justify-center border border-admin-gold/30">
              <img 
                src={schoolSettings.logoUrl || defaultSchoolLogo} 
                alt="ESTEADEB Logo" 
                className="w-9 h-9 object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
                SIGTEO <span className="text-admin-gold bg-admin-navy-medium border border-admin-gold/30 font-bold px-2 py-0.5 rounded ml-1.5 text-xs tracking-widest">RECIBOS</span>
              </h1>
              <p className="text-[11px] text-slate-300 font-medium tracking-wide">Escola Teológica AD Brasil</p>
            </div>
          </div>

          {/* Desktop Menu Navigation Panel */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            {[
              { id: "dashboard", label: "Início", icon: Home },
              { id: "teachers", label: "Professores", icon: Users },
              { id: "nuclei", label: "Núcleos de Ensino", icon: BookOpen },
              { id: "generate", label: "Gerar Recibo", icon: Printer },
              { id: "history", label: "Histórico", icon: History },
              { id: "settings", label: "Configurações", icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all duration-150 ${
                    isActive 
                      ? "bg-admin-gold text-admin-navy shadow-md border border-admin-gold" 
                      : "text-slate-200 hover:bg-admin-navy-medium hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 text-current" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile responsive toggle */}
          <div className="lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-admin-navy-medium text-slate-300"
              aria-label="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-admin-navy px-4 pt-2 pb-4 border-t border-admin-navy-medium flex flex-col space-y-1 animate-fade-in shadow-xl">
            {[
              { id: "dashboard", label: "Início/Resumo", icon: Home },
              { id: "teachers", label: "Cadastro de Professores", icon: Users },
              { id: "nuclei", label: "Cadastro de Núcleos", icon: BookOpen },
              { id: "generate", label: "Gerar Novo Recibo", icon: Printer },
              { id: "history", label: "Histórico de Recibos", icon: History },
              { id: "settings", label: "Configurações da Escola", icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left font-semibold text-xs tracking-wide transition ${
                    isActive 
                      ? "bg-admin-gold text-admin-navy" 
                      : "text-slate-300 hover:bg-admin-navy-medium hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 text-current" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* FLOATING SUCCESS/ERR SYSTEM NOTIFICATION */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-bounce print:hidden max-w-sm">
          <div className={`p-4 rounded-lg shadow-lg flex items-center space-x-3 border ${
            notification.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : notification.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            {notification.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
            {notification.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />}
            {notification.type === "info" && <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />}
            <p className="text-sm font-medium">{notification.text}</p>
          </div>
        </div>
      )}

      {/* CORE SCREENS CONTROLLER */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 xl:px-12 print:hidden">

        {/* 1. DASHBOARD VIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
                {/* Elegant banner welcome card */}
            <div className="bg-gradient-to-br from-admin-navy to-admin-navy-medium text-white p-6 md:p-8 rounded-2xl shadow-xl border-b-4 border-admin-gold relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-6 pointer-events-none">
                <img src={schoolSettings.logoUrl || defaultSchoolLogo} className="w-96 h-96" alt="" referrerPolicy="no-referrer" />
              </div>
              <div className="z-10 relative max-w-2xl">
                <span className="bg-admin-gold text-admin-navy text-[10px] px-3 py-1 rounded-full font-extrabold tracking-wider uppercase border border-admin-gold/30">
                  Painel de Secretaria Administrativo
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mt-4 tracking-tight font-sans text-white">
                  SIGTEO - Emissão de Recibos Escolares
                </h2>
                <p className="mt-2 text-slate-300 text-xs md:text-sm leading-relaxed max-w-xl">
                  Bem-vindo ao portal institucional da <strong>ESTEADEB</strong>. 
                  Controle a secretaria com facilidade: gerencie o cadastro de professores, organize núcleos e emita recibos formatados no padrão de página A4 duplo para impressão instantânea.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button 
                    onClick={() => setActiveTab("generate")} 
                    className="bg-admin-gold hover:bg-admin-gold-dark text-admin-navy font-extrabold px-5 py-3 rounded-xl transition duration-150 text-xs flex items-center space-x-2 shadow-lg cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <Printer className="w-4 h-4 text-current" />
                    <span>Gerar Recibo Escolar</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("teachers")}
                    className="bg-admin-navy-light/40 hover:bg-admin-navy-light/80 text-white border border-slate-700/60 font-bold px-5 py-3 rounded-xl transition duration-150 text-xs flex items-center space-x-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-admin-gold" />
                    <span>Ver Docentes Cadastrados</span>
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK STATS GRAPHIC PANEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 flex items-center space-x-4 relative overflow-hidden group hover:shadow-md transition duration-200">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-admin-navy"></div>
                <div className="p-3 bg-slate-100 text-admin-navy rounded-lg transition duration-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Professores</p>
                  <h3 className="text-xl font-extrabold text-admin-navy mt-0.5">{totalTeachers}</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 flex items-center space-x-4 relative overflow-hidden group hover:shadow-md transition duration-200">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-admin-gold"></div>
                <div className="p-3 bg-admin-gold-light text-admin-gold-dark rounded-lg transition duration-200">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Núcleos de Ensino</p>
                  <h3 className="text-xl font-extrabold text-admin-navy mt-0.5">{totalNuclei}</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 flex items-center space-x-4 relative overflow-hidden group hover:shadow-md transition duration-200">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"></div>
                <div className="p-3 bg-teal-50 text-teal-700 rounded-lg transition duration-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recibos Emitidos</p>
                  <h3 className="text-xl font-extrabold text-admin-navy mt-0.5">{totalReceiptsCount}</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 flex items-center space-x-4 relative overflow-hidden group hover:shadow-md transition duration-200">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600"></div>
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg transition duration-200">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pago no Mês Atual</p>
                  <h3 className="text-xl font-extrabold text-emerald-600 mt-0.5">{formatCurrency(totalPaidCurrentMonth)}</h3>
                </div>
              </div>

            </div>

            {/* RECENT ACCOMPLISHMENTS / SHORTCUTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Institutional Details */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4 lg:col-span-2">
                <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100">Ficha Informativa Escolar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Nome Completo</span>
                    <p className="text-sm font-bold text-slate-800">{schoolSettings.nome}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">CNPJ Oficial</span>
                    <p className="text-sm font-medium text-slate-800">{schoolSettings.cnpj}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Endereço Principal</span>
                    <p className="text-sm text-slate-700">{schoolSettings.endereco}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Contatos de Secretaria</span>
                    <p className="text-sm text-slate-700">{schoolSettings.telefone} | {schoolSettings.email}</p>
                  </div>
                </div>
                {teachers.length === 0 && nuclei.length === 0 && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-4 h-4" /> Central de Auxílio à Demonstração
                    </p>
                    O sistema está atualmente limpo de registros. Para testar o fluxo completo de geração de recibo com dados pré-preenchidos, clique no botão para carregar dados falsificados de demonstração.
                    <button 
                      onClick={setupDefaultMockData}
                      className="mt-2 block bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded"
                    >
                      Carregar Registros de Demonstração
                    </button>
                  </div>
                )}
              </div>

              {/* Action Shortcuts */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100">Atalhos Administrativos</h3>
                  <div className="mt-4 space-y-2">
                    <button 
                      onClick={() => { setActiveTab("teachers"); setIsTeacherModalOpen(true); }}
                      className="w-full text-left text-xs text-blue-900 border border-blue-100 hover:bg-blue-50/50 p-2.5 rounded-lg flex items-center justify-between font-medium transition"
                    >
                      <span>Novo Professor</span>
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setActiveTab("nuclei"); setIsNucleusModalOpen(true); }}
                      className="w-full text-left text-xs text-amber-900 border border-amber-100 hover:bg-amber-50/50 p-2.5 rounded-lg flex items-center justify-between font-medium transition"
                    >
                      <span>Novo Núcleo Teológico</span>
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveTab("settings")}
                      className="w-full text-left text-xs text-slate-700 border border-slate-200 hover:bg-slate-100 p-2.5 rounded-lg flex items-center justify-between font-medium transition"
                    >
                      <span>Configurações & Backup</span>
                      <Settings className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 mt-4 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">SIGTEO Recibos ESTEADEB v1.0</span>
                </div>
              </div>

            </div>

            {/* LATEST GENERATED RECEIPTS LIST BOX */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800">Recibos Emitidos Recentemente</h3>
                <button onClick={() => setActiveTab("history")} className="text-xs font-bold text-blue-900 hover:underline">Ver Todo o Histórico &rarr;</button>
              </div>

              {receipts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto stroke-1 mb-2" />
                  Nenhum recibo foi gerado no sistema ainda.
                </div>
              ) : (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4">Data</th>
                        <th className="py-3 px-4">Professor</th>
                        <th className="py-3 px-4">Núcleo Teológico</th>
                        <th className="py-3 px-4">Valor</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {receipts.slice(0, 5).map(receipt => (
                        <tr key={receipt.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono select-none">{new Date(receipt.data + "T12:00:00").toLocaleDateString('pt-BR')}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{receipt.nomeProfessor}</td>
                          <td className="py-3 px-4">{receipt.nomeNucleo} ({receipt.cursoNucleo})</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">{formatCurrency(receipt.valor)}</td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button 
                              onClick={() => handlePreviewReceipt(receipt)}
                              className="text-blue-900 hover:text-blue-700 hover:underline font-bold"
                              title="Visualizar Recibo"
                            >
                              Visualizar
                            </button>
                            <button 
                              onClick={() => handlePrintExistingReceipt(receipt)}
                              className="text-amber-600 hover:text-amber-700 hover:underline font-bold ml-2.5"
                              title="Imprimir Recibo"
                            >
                              Imprimir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. TEACHERS SECTION */}
        {activeTab === "teachers" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold font-sans text-admin-navy">Cadastro de Docentes</h2>
                <p className="text-xs text-slate-500">Gerenciamento acadêmico e administrativo dos docentes da ESTEADEB</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input 
                  type="file" 
                  ref={excelImportInputRef} 
                  onChange={importTeachersFromExcel} 
                  accept=".xlsx, .xls" 
                  className="hidden" 
                />

                <button
                  onClick={() => excelImportInputRef.current?.click()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center space-x-2 transition duration-150 cursor-pointer border border-slate-200"
                  title="Selecione um arquivo Excel contendo cadastro de professores"
                >
                  <Upload className="w-4 h-4 text-admin-navy" />
                  <span>Importar Excel</span>
                </button>

                <button
                  onClick={downloadExcelTemplate}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center space-x-2 transition duration-150 cursor-pointer border border-amber-200"
                  title="Baixar planilha modelo vazia/exemplo de importação"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                  <span>Baixar Modelo Excel</span>
                </button>

                <button
                  onClick={exportTeachersToExcel}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center space-x-2 transition duration-150 cursor-pointer border border-emerald-600"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Exportar Excel</span>
                </button>

                <button
                  onClick={() => {
                    setEditingTeacher(null);
                    setTeacherForm({
                      nome: "",
                      cpf: "",
                      endereco: "",
                      bairro: "",
                      cidadeUf: "Natal/RN",
                      cep: "",
                      telefone: "",
                      email: "",
                      dadosBancarios: "",
                      observacoes: "",
                      whatsapp: "",
                      aniversario: "",
                      congregacao: "",
                      nivelFormacao: "",
                      nomeCurso: "",
                      instituicaoFormacao: "",
                      anoConclusao: "",
                      chavePix: "",
                      banco: "",
                      tipoConta: "",
                      operacao: "",
                      agencia: "",
                      conta: ""
                    });
                    setIsTeacherModalOpen(true);
                  }}
                  className="bg-admin-navy hover:bg-admin-navy-medium text-white hover:text-admin-gold font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center space-x-2 transition duration-150 border border-admin-navy cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-admin-gold" />
                  <span>Novo Professor</span>
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Pesquisar professor pelo nome ou CPF..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold bg-slate-50 focus:bg-white transition"
                />
              </div>
              {teacherSearch && (
                <button 
                  onClick={() => setTeacherSearch("")}
                  className="ml-2 text-xs text-slate-500 hover:text-admin-navy font-bold cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Teachers Table Grid */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Users className="w-10 h-10 mx-auto stroke-1 text-slate-300 mb-2" />
                  Nenhum professor cadastrado corresponde à pesquisa realizada.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-admin-navy text-white font-bold uppercase tracking-wider text-[10px] border-b border-admin-navy">
                        <th className="py-4 px-4 text-slate-100">Nome do Professor</th>
                        <th className="py-4 px-4 text-slate-100">CPF</th>
                        <th className="py-4 px-4 text-slate-100">Contatos</th>
                        <th className="py-4 px-4 text-slate-100">Endereço da Residência</th>
                        <th className="py-4 px-4 text-right text-slate-100">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTeachers.map(teacher => (
                        <tr key={teacher.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 block text-sm">{teacher.nome}</span>
                            {teacher.dadosBancarios && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono font-medium mt-0.5 inline-block">
                                Banco: {teacher.dadosBancarios}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">{teacher.cpf}</td>
                          <td className="py-3 px-4 space-y-0.5 text-slate-600">
                            <div className="block">{teacher.telefone}</div>
                            <div className="block text-slate-400 text-[11px]">{teacher.email}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-650">
                            <div>{teacher.endereco}, Bairro {teacher.bairro}</div>
                            <div className="text-slate-400 text-[10px]">{teacher.cep} | {teacher.cidadeUf}</div>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => startEditTeacher(teacher)}
                              className="text-slate-800 hover:text-blue-900 border border-slate-200 hover:bg-slate-100 p-1.5 rounded"
                              title="Editar professor"
                            >
                              <Edit className="w-3.5 h-3.5 inline" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(teacher.id, teacher.nome)}
                              className="text-rose-600 hover:text-white border border-rose-100 hover:bg-rose-600 p-1.5 rounded"
                              title="Excluir professor"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* TEACHER MODAL FORM */}
            {isTeacherModalOpen && (
              <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl relative border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between py-4 px-6 border-b border-slate-150 bg-slate-50">
                    <h4 className="text-sm font-bold text-admin-navy flex items-center space-x-2 font-sans">
                      <Users className="w-5 h-5 text-admin-gold" />
                      <span>{editingTeacher ? "Editar Ficha de Docente" : "Cadastrar Novo Professor"}</span>
                    </h4>
                    <button 
                      onClick={() => setIsTeacherModalOpen(false)} 
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-200 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Scrollable Body */}
                  <form onSubmit={handleSaveTeacher} className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* SECTION 1: DADOS PESSOAIS */}
                    <div className="space-y-4">
                      <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-admin-navy border-b border-slate-100 pb-1.5 font-sans flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-admin-gold"></span>
                        <span>1. Dados Pessoais & Contatos</span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-700 block mb-1">Nome Completo *</label>
                          <input
                            type="text"
                            required
                            value={teacherForm.nome}
                            onChange={(e) => setTeacherForm({...teacherForm, nome: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition font-medium"
                            placeholder="Ex: Prof. Dr. Carlos Augusto"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">CPF *</label>
                          <input
                            type="text"
                            required
                            value={teacherForm.cpf}
                            onChange={(e) => setTeacherForm({...teacherForm, cpf: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition font-mono"
                            placeholder="Ex: 000.000.000-00"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Telefone Celular *</label>
                          <input
                            type="text"
                            required
                            value={teacherForm.telefone}
                            onChange={(e) => setTeacherForm({...teacherForm, telefone: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: (84) 99999-8888"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp</label>
                          <input
                            type="text"
                            value={teacherForm.whatsapp}
                            onChange={(e) => setTeacherForm({...teacherForm, whatsapp: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: (84) 99999-8888"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Data Aniversário (Dia/Mês)</label>
                          <input
                            type="text"
                            value={teacherForm.aniversario}
                            onChange={(e) => setTeacherForm({...teacherForm, aniversario: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: 15/Outubro"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-700 block mb-1">E-mail de Contato *</label>
                          <input
                            type="email"
                            required
                            value={teacherForm.email}
                            onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: professor@email.com"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Congregação</label>
                          <input
                            type="text"
                            value={teacherForm.congregacao}
                            onChange={(e) => setTeacherForm({...teacherForm, congregacao: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: AD Sede / Templo Central"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: ENDEREÇO */}
                    <div className="space-y-4 pt-2">
                      <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-admin-navy border-b border-slate-100 pb-1.5 font-sans flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-admin-gold"></span>
                        <span>2. Endereço Residencial</span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">CEP</label>
                          <input
                            type="text"
                            value={teacherForm.cep}
                            onChange={(e) => setTeacherForm({...teacherForm, cep: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: 59000-000"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-700 block mb-1">Endereço Principal (Rua, Nº) *</label>
                          <input
                            type="text"
                            required
                            value={teacherForm.endereco}
                            onChange={(e) => setTeacherForm({...teacherForm, endereco: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: Av. Floriano Peixoto, 150 - Apt 201"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Bairro *</label>
                          <input
                            type="text"
                            required
                            value={teacherForm.bairro}
                            onChange={(e) => setTeacherForm({...teacherForm, bairro: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: Alecrim"
                          />
                        </div>

                        <div className="md:col-span-21">
                          <label className="text-xs font-bold text-slate-700 block mb-1">Cidade / UF *</label>
                          <input
                            type="text"
                            required
                            value={teacherForm.cidadeUf}
                            onChange={(e) => setTeacherForm({...teacherForm, cidadeUf: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: Natal/RN"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: FORMAÇÃO ACADÊMICA */}
                    <div className="space-y-4 pt-2">
                      <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-admin-navy border-b border-slate-100 pb-1.5 font-sans flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-admin-gold"></span>
                        <span>3. Formação Acadêmica & Docência</span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Nível de Formação</label>
                          <select
                            value={teacherForm.nivelFormacao}
                            onChange={(e) => setTeacherForm({...teacherForm, nivelFormacao: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition font-medium"
                          >
                            <option value="">Selecione...</option>
                            <option value="Médio em Teologia">Médio em Teologia</option>
                            <option value="Bacharelado">Bacharelado</option>
                            <option value="Especialização / Pós">Especialização / Pós</option>
                            <option value="Mestrado">Mestrado</option>
                            <option value="Doutorado">Doutorado</option>
                            <option value="Outros">Outros</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Curso</label>
                          <input
                            type="text"
                            value={teacherForm.nomeCurso}
                            onChange={(e) => setTeacherForm({...teacherForm, nomeCurso: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: Bacharel em Teologia Sistemática"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Ano de Conclusão</label>
                          <input
                            type="text"
                            value={teacherForm.anoConclusao}
                            onChange={(e) => setTeacherForm({...teacherForm, anoConclusao: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: 2024"
                          />
                        </div>

                        <div className="md:col-span-4">
                          <label className="text-xs font-bold text-slate-700 block mb-1">Instituição de Formação</label>
                          <input
                            type="text"
                            value={teacherForm.instituicaoFormacao}
                            onChange={(e) => setTeacherForm({...teacherForm, instituicaoFormacao: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: ESTEADEB - Escola Teológica das Assembleias de Deus no Brasil"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: INFORMAÇÕES FINANCEIRAS */}
                    <div className="space-y-4 pt-2">
                      <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-admin-navy border-b border-slate-100 pb-1.5 font-sans flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-admin-gold"></span>
                        <span>4. Informações de Recebimento & PIX</span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Chave PIX</label>
                          <input
                            type="text"
                            value={teacherForm.chavePix}
                            onChange={(e) => setTeacherForm({...teacherForm, chavePix: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: pix@professor.com ou CPF"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Banco / Instituição</label>
                          <input
                            type="text"
                            value={teacherForm.banco}
                            onChange={(e) => setTeacherForm({...teacherForm, banco: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: Nubank, Itaú"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Tipo de Conta</label>
                          <select
                            value={teacherForm.tipoConta}
                            onChange={(e) => setTeacherForm({...teacherForm, tipoConta: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition font-medium"
                          >
                            <option value="">Selecione...</option>
                            <option value="Corrente">Corrente</option>
                            <option value="Poupança">Poupança</option>
                            <option value="Salário">Salário</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Operação (Se houver)</label>
                          <input
                            type="text"
                            value={teacherForm.operacao}
                            onChange={(e) => setTeacherForm({...teacherForm, operacao: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: 013"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Agência</label>
                          <input
                            type="text"
                            value={teacherForm.agencia}
                            onChange={(e) => setTeacherForm({...teacherForm, agencia: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: 1234"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Conta (com dígito)</label>
                          <input
                            type="text"
                            value={teacherForm.conta}
                            onChange={(e) => setTeacherForm({...teacherForm, conta: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: 12345-6"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="text-xs font-bold text-slate-700 block mb-1">Descrição Adicional de Pagamento (Opcional)</label>
                          <input
                            type="text"
                            value={teacherForm.dadosBancarios}
                            onChange={(e) => setTeacherForm({...teacherForm, dadosBancarios: e.target.value})}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                            placeholder="Ex: Preferencialmente transferir pelo PIX nas segundas-feiras"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: OBSERVAÇÕES */}
                    <div className="space-y-4 pt-2">
                      <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-admin-navy border-b border-slate-100 pb-1.5 font-sans flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-admin-gold"></span>
                        <span>5. Observações do Docente</span>
                      </h5>
                      <textarea
                        rows={2}
                        value={teacherForm.observacoes}
                        onChange={(e) => setTeacherForm({...teacherForm, observacoes: e.target.value})}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                        placeholder="Insira notas administrativas privadas sobre o docente..."
                      />
                    </div>

                    {/* Modal Submit Footer (Sticky aligned) */}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-slate-150 bg-white sticky bottom-0">
                      <button
                        type="button"
                        onClick={() => setIsTeacherModalOpen(false)}
                        className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer transition duration-150"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs bg-admin-navy hover:bg-admin-navy-medium text-white hover:text-admin-gold font-bold rounded-lg cursor-pointer transition duration-150 shadow border border-admin-navy"
                      >
                        {editingTeacher ? "Atualizar Ficha de Docente" : "Confirmar Cadastro"}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 3. NUCLEI SECTION */}
        {activeTab === "nuclei" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold font-sans text-admin-navy">Cadastro de Núcleos de Ensino</h2>
                <p className="text-xs text-slate-500">Gestão dos pólos regionais de extensão teológica da ESTEADEB</p>
              </div>
              <button
                onClick={() => {
                  setEditingNucleus(null);
                  setNucleusForm({
                    nome: "",
                    curso: "Médio em Teologia",
                    cidade: "Natal",
                    coordenador: "",
                    observacoes: ""
                  });
                  setIsNucleusModalOpen(true);
                }}
                className="bg-admin-navy hover:bg-admin-navy-medium text-white hover:text-admin-gold font-bold text-xs py-2.5 px-4 rounded-xl shadow-md border border-admin-navy cursor-pointer flex items-center space-x-2 w-max transition duration-150"
              >
                <Plus className="w-4 h-4 text-admin-gold" />
                <span>Novo Núcleo</span>
              </button>
            </div>

            {/* Filter Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Pesquisar núcleo de ensino pelo nome ou coordenador..."
                  value={nucleusSearch}
                  onChange={(e) => setNucleusSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-admin-gold bg-slate-50 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {filteredNuclei.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <BookOpen className="w-10 h-10 mx-auto stroke-1 text-slate-300 mb-2" />
                  Nenhum núcleo registrado corresponde aos termos informados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-admin-navy text-white font-bold uppercase tracking-wider text-[10px] border-b border-admin-navy animate-fade-in">
                        <th className="py-4 px-4 text-slate-100">Nome do Núcleo</th>
                        <th className="py-4 px-4 text-slate-100">Cidade Pólo</th>
                        <th className="py-4 px-4 text-slate-100">Curso Vinculado</th>
                        <th className="py-4 px-4 text-slate-100">Coordenador do Núcleo</th>
                        <th className="py-4 px-4 text-slate-100">Anotações</th>
                        <th className="py-4 px-4 text-right text-slate-100">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredNuclei.map(nuc => (
                        <tr key={nuc.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-850 text-sm">{nuc.nome}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">{nuc.cidade}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-150 inline-block">
                              {nuc.curso}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-blue-950">{nuc.coordenador}</td>
                          <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 italic">{nuc.observacoes || "-"}</td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => startEditNucleus(nuc)}
                              className="text-slate-850 hover:text-blue-900 border border-slate-200 hover:bg-slate-100 p-1.5 rounded"
                              title="Editar núcleo"
                            >
                              <Edit className="w-3.5 h-3.5 inline" />
                            </button>
                            <button
                              onClick={() => handleDeleteNucleus(nuc.id, nuc.nome)}
                              className="text-rose-600 hover:text-white border border-rose-100 hover:bg-rose-600 p-1.5 rounded"
                              title="Excluir núcleo"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* NUCLEUS MODAL FORM */}
            {isNucleusModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative border border-slate-200 py-6 px-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <h4 className="text-base font-extrabold text-blue-950 flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-amber-500" />
                      <span>{editingNucleus ? "Editar Detalhes do Núcleo" : "Cadastrar Novo Núcleo"}</span>
                    </h4>
                    <button onClick={() => setIsNucleusModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveNucleus} className="space-y-4 mt-4">
                    
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Núcleo *</label>
                      <input
                        type="text"
                        required
                        value={nucleusForm.nome}
                        onChange={(e) => setNucleusForm({...nucleusForm, nome: e.target.value})}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50 transition"
                        placeholder="Ex: Soledade 2"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Curso Vinculado *</label>
                      <select
                        required
                        value={nucleusForm.curso}
                        onChange={(e) => setNucleusForm({...nucleusForm, curso: e.target.value})}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50 transition font-medium"
                      >
                        <option value="Médio em Teologia">Médio em Teologia</option>
                        <option value="Básico em Teologia">Básico em Teologia</option>
                        <option value="Bacharelado em Teologia">Bacharelado em Teologia</option>
                        <option value="Pós-Graduação Teológica">Pós-Graduação Teológica</option>
                        <option value="Curso de Formação de Professores">Curso de Formação de Professores</option>
                        <option value="Extensão em Liderança Cristã">Extensão em Liderança Cristã</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Cidade Pólo *</label>
                      <input
                        type="text"
                        required
                        value={nucleusForm.cidade}
                        onChange={(e) => setNucleusForm({...nucleusForm, cidade: e.target.value})}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50 transition"
                        placeholder="Ex: Natal"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Coordenador Regional *</label>
                      <input
                        type="text"
                        required
                        value={nucleusForm.coordenador}
                        onChange={(e) => setNucleusForm({...nucleusForm, coordenador: e.target.value})}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50 transition"
                        placeholder="Ex: Past. José Mendes"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Notas Adicionais</label>
                      <textarea
                        rows={2}
                        value={nucleusForm.observacoes}
                        onChange={(e) => setNucleusForm({...nucleusForm, observacoes: e.target.value})}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50 transition"
                        placeholder="Anotações gerais..."
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t border-slate-150">
                      <button
                        type="button"
                        onClick={() => setIsNucleusModalOpen(false)}
                        className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs bg-blue-900 text-white rounded-lg hover:bg-blue-950 font-bold"
                      >
                        {editingNucleus ? "Atualizar Núcleo" : "Salvar Núcleo"}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 4. SETTINGS SECTION */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            
            {/* Page Header */}
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-xl font-extrabold text-slate-950">Configurações da Escola ESTEADEB</h2>
              <p className="text-xs text-slate-500">Personalize a identidade da escola, realize exportação de dados e gerencie backups</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Profile Configs Form */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
                <h3 className="text-sm font-bold text-slate-950 uppercase tracking-widest pb-2 border-b border-slate-100 flex items-center space-x-1.5">
                  <Building className="w-4 h-4 text-amber-500" />
                  <span>Razão Social e Contatos de Secretaria</span>
                </h3>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nome Completo da Escola / Razão Social</label>
                    <input
                      type="text"
                      value={schoolSettings.nome}
                      onChange={(e) => setSchoolSettings({...schoolSettings, nome: e.target.value})}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Documento CNPJ Oficial</label>
                    <input
                      type="text"
                      value={schoolSettings.cnpj}
                      onChange={(e) => setSchoolSettings({...schoolSettings, cnpj: e.target.value})}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Telefone Principal</label>
                    <input
                      type="text"
                      value={schoolSettings.telefone}
                      onChange={(e) => setSchoolSettings({...schoolSettings, telefone: e.target.value})}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50 transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Endereço de Secretaria (Impresso no Rodapé)</label>
                    <input
                      type="text"
                      value={schoolSettings.endereco}
                      onChange={(e) => setSchoolSettings({...schoolSettings, endereco: e.target.value})}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50 transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">E-mail para Emissão / Secretaria</label>
                    <input
                      type="email"
                      value={schoolSettings.email}
                      onChange={(e) => setSchoolSettings({...schoolSettings, email: e.target.value})}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50 transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Texto Base Opcional de Recibo</label>
                    <textarea
                      rows={2}
                      value={schoolSettings.textoPadrao}
                      onChange={(e) => setSchoolSettings({...schoolSettings, textoPadrao: e.target.value})}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50 transition"
                      placeholder="Recebi de..."
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Opcional. Substitui a estruturação automática quando informado.</span>
                  </div>
                </form>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-450">
                  <span className="flex items-center text-amber-600 font-semibold">
                    <CheckCircle className="w-4 h-4 mr-1 text-emerald-500" />
                    Salvo localmente em tiempo real.
                  </span>
                </div>
              </div>

              {/* Logo Management & Reset panel */}
              <div className="space-y-6">
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-950 uppercase tracking-widest pb-1 border-b border-slate-100">Logo do Recibo</h3>
                  
                  <div className="flex flex-col items-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <img 
                      src={schoolSettings.logoUrl || defaultSchoolLogo} 
                      alt="Logo da Escola" 
                      className="w-20 h-20 object-contain rounded-full bg-white shadow-inner p-1.5"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[11px] text-slate-400 mt-2">Visualização Atual da Logo</span>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-center bg-admin-navy text-white hover:text-admin-gold text-xs font-bold py-2.5 px-4 rounded-lg cursor-pointer hover:bg-admin-navy-medium border border-admin-navy shadow-sm transition">
                      <Upload className="w-3.5 h-3.5 inline mr-1 text-admin-gold" />
                      Fazer Upload de Imagem de Logo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                    </label>

                    <div className="pt-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Ou cole a URL da Logo na Web (link):</label>
                      <input 
                        type="text" 
                        value={schoolSettings.logoUrl?.startsWith("data:") ? "" : (schoolSettings.logoUrl || "")}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                        placeholder="Ex: https://meusite.com/sua_logo.png"
                      />
                    </div>

                    {schoolSettings.logoUrl && (
                      <button
                        onClick={handleResetLogo}
                        className="w-full text-center bg-transparent hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 text-xs font-semibold py-2 px-4 rounded-lg cursor-pointer transition"
                      >
                        Restaurar Logo Espiritual Padrão
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-950 uppercase tracking-widest pb-2 border-b border-slate-100">Backup e Reset</h3>
                  
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Você pode salvaguardar os dados do seu sistema baixando uma cópia JSON local, ou importar dados anteriores.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={exportBackup}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold p-2.5 rounded-lg flex flex-col items-center justify-center space-y-1 block border border-slate-200 transition"
                    >
                      <Download className="w-5 h-5 text-slate-600" />
                      <span>Exportar JSON</span>
                    </button>

                    <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold p-2.5 rounded-lg flex flex-col items-center justify-center space-y-1 cursor-pointer border border-slate-200 transition text-center">
                      <Upload className="w-5 h-5 text-slate-600" />
                      <span>Importar JSON</span>
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={importBackup} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={clearAllDataConfirm}
                      className="w-full text-center bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-2 px-4 rounded-lg border border-rose-200 transition"
                    >
                      Apagar Todos os Registros
                    </button>
                    
                    <button 
                      onClick={setupDefaultMockData}
                      className="w-full text-center mt-2 text-slate-500 hover:text-slate-800 text-[11px] font-medium"
                    >
                      Carregar dados de teste
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 5. GENERATE RECEIPT SECTION */}
        {activeTab === "generate" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Page Header */}
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold font-sans text-admin-navy">Emitir Novo Recibo de Pagamento</h2>
              <p className="text-xs text-slate-500">Preencha os valores para gerar e imprimir os recibos no padrão institucional</p>
            </div>

            {/* Quick configuration alert if there are no teachers or nucleos */}
            {(teachers.length === 0 || nuclei.length === 0) && (
              <div className="bg-admin-gold-light border border-admin-gold/30 p-4 rounded-xl flex items-start space-x-3 text-admin-navy text-xs leading-relaxed animate-fade-in shadow-sm">
                <AlertCircle className="w-5 h-5 text-admin-gold-dark flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Atenção: Cadastros Necessários</h4>
                  <p className="mt-1 font-medium text-slate-700">
                    Você precisa possuir pelo menos 1 professor e 1 núcleo de ensino cadastrado para poder gerar recibos. 
                    Por favor, vá para os menus correspondentes primeiro ou carregue os registros de demonstração abaixo.
                  </p>
                  <button 
                    onClick={setupDefaultMockData}
                    className="mt-3 bg-admin-navy hover:bg-admin-navy-medium text-white hover:text-admin-gold font-bold py-1.5 px-4 rounded text-[11px] transition duration-150 cursor-pointer shadow"
                  >
                    Carregar Registros de Demonstração
                  </button>
                </div>
              </div>
            )}

            {/* Main grid panel */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              
              {/* Form parameters */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-3 space-y-4">
                <h3 className="text-sm font-bold text-admin-navy uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center space-x-1.5 font-sans">
                  <Printer className="w-4 h-4 text-admin-gold" />
                  <span>Parâmetros de Secretaria</span>
                </h3>

                <form onSubmit={handleGenerateReceipt} className="space-y-4">
                  
                  {/* Model/Template template switcher */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <label className="text-xs font-bold text-admin-navy block mb-2">Modelo de Recibo / Layout Institucional</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setReceiptTemplate("docente")}
                        className={`flex flex-col items-start p-3 rounded-lg border text-left transition cursor-pointer ${
                          receiptTemplate === "docente"
                            ? "bg-blue-50 border-blue-400 ring-1 ring-blue-405"
                            : "bg-white border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 block">Docência / Professor</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Layout com tabelas e caixas, ideal para aulas e honorários letivos.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReceiptTemplate("coordenador_secretario")}
                        className={`flex flex-col items-start p-3 rounded-lg border text-left transition cursor-pointer ${
                          receiptTemplate === "coordenador_secretario"
                            ? "bg-amber-50 border-amber-400 ring-1 ring-amber-405"
                            : "bg-white border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 block flex items-center gap-1">
                          Coordenador / Secretário <span className="bg-amber-100 text-amber-800 text-[9px] px-1 rounded uppercase font-bold">Modelo Oficial</span>
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Layout centrado baseado no modelo enviado. Perfeito para comissões e secretarias.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReceiptTemplate("tesouraria")}
                        className={`flex flex-col items-start p-3 rounded-lg border text-left transition cursor-pointer ${
                          receiptTemplate === "tesouraria"
                            ? "bg-emerald-50 border-emerald-400 ring-1 ring-emerald-405"
                            : "bg-white border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 block flex items-center gap-1">
                          Tesouraria / Caixa <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1 rounded uppercase font-bold">Novo</span>
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Layout moderno com comprovante de forma de pagamento, assinaturas duplas e dados simplificados.</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Prefill selection dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Selecionar Professor *</label>
                      <select
                        required
                        value={selectedTeacherId}
                        onChange={(e) => {
                          setSelectedTeacherId(e.target.value);
                        }}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 font-medium"
                      >
                        <option value="">Selecione na lista...</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.nome} (CPF: {t.cpf})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Selecionar Núcleo Teológico *</label>
                      <select
                        required
                        value={selectedNucleusId}
                        onChange={(e) => {
                          setSelectedNucleusId(e.target.value);
                        }}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 font-medium"
                      >
                        <option value="">Selecione na lista...</option>
                        {nuclei.map(n => (
                          <option key={n.id} value={n.id}>{n.nome} - {n.curso}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Disciplina / Matéria (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Introdução à Teologia, Homilética..."
                        value={receiptDisciplina}
                        onChange={(e) => setReceiptDisciplina(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition font-medium"
                      />
                    </div>
                  </div>

                  {/* Date and Values */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Data *</label>
                      <input
                        type="date"
                        required
                        value={receiptDate}
                        onChange={(e) => setReceiptDate(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold bg-slate-50 transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Valor do Pagamento R$ *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 850.00"
                        value={receiptValueInput}
                        onChange={(e) => handleValueChange(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition font-bold text-admin-navy"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">Disposição na Página</label>
                      <div className="flex items-center space-x-4 mt-2">
                        <label className="flex items-center text-xs font-medium cursor-pointer space-x-1.5 select-none text-slate-700">
                          <input 
                            type="radio" 
                            name="via_layout" 
                            checked={printLayoutConfig === "1_via"} 
                            onChange={() => setPrintLayoutConfig("1_via")} 
                            className="text-admin-gold focus:ring-0 focus:outline-none"
                          />
                          <span>1 Por Folha</span>
                        </label>
                        <label className="flex items-center text-xs font-medium cursor-pointer space-x-1.5 select-none text-slate-700" title="Imprimir duas vias de forma a economizar papel A4">
                          <input 
                            type="radio" 
                            name="via_layout" 
                            checked={printLayoutConfig === "2_vias"} 
                            onChange={() => setPrintLayoutConfig("2_vias")}
                            className="text-admin-gold focus:ring-0 focus:outline-none"
                          />
                          <span className="font-semibold text-slate-900 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-[10px]">2 Por Folha (Indicada)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Extensive value (Auto-filled but editable) */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Valor por Extenso (Auto-Gerado / Editável) *</label>
                      {receiptValueExtenso && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded font-bold">Gerado com Sucesso</span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="um mil duzentos e cinquenta reais"
                      value={receiptValueExtenso}
                      onChange={(e) => setReceiptValueExtenso(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition"
                    />
                  </div>

                   {/* Referente details */}
                   <div>
                     <div className="flex items-center justify-between mb-1">
                       <label className="text-xs font-bold text-slate-700 block">Referente a (Detalhamento do Recebimento) *</label>
                       <span className="text-[10px] text-slate-400 font-semibold">Modelos Rápidos abaixo:</span>
                     </div>
                     <textarea
                       rows={2}
                       required
                       value={receiptReferente}
                       onChange={(e) => setReceiptReferente(e.target.value)}
                       className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-admin-gold focus:bg-white bg-slate-50 transition leading-relaxed font-medium"
                       placeholder="Ex: aulas ministradas sobre Introdução à Teologia - Médio em Teologia no núcleo supracitado"
                     />
                     <div className="flex flex-wrap gap-1.5 mt-1.5">
                       <button
                         type="button"
                         onClick={() => {
                           const nucleus = nuclei.find(n => n.id === selectedNucleusId);
                           const cleanCurso = nucleus ? nucleus.curso : "[CURSO]";
                           const cleanNucleo = nucleus ? nucleus.nome : "[NÚCLEO]";
                           setReceiptReferente(`aulas ministradas referente ao curso ${cleanCurso} no Núcleo ${cleanNucleo} da ESTEADEB`);
                         }}
                         className="px-2 py-1 bg-blue-50/50 hover:bg-blue-50 text-blue-800 text-[10.5px] font-bold rounded-lg border border-blue-200 transition cursor-pointer"
                       >
                         Docência / Aulas
                       </button>
                       <button
                         type="button"
                         onClick={() => setReceiptReferente("comissão de coordenador no núcleo supracitado.")}
                         className="px-2 py-1 bg-amber-50/50 hover:bg-amber-50 text-amber-800 text-[10.5px] font-bold rounded-lg border border-amber-200 transition cursor-pointer"
                       >
                         Comissão de Coordenador
                       </button>
                       <button
                         type="button"
                         onClick={() => setReceiptReferente("comissão de secretário no núcleo supracitado.")}
                         className="px-2 py-1 bg-amber-50/50 hover:bg-amber-50 text-amber-800 text-[10.5px] font-bold rounded-lg border border-amber-200 transition cursor-pointer font-bold"
                       >
                         Comissão de Secretário
                       </button>
                     </div>
                   </div>

                  {/* Submit / Trigger action */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                    {selectedTeacherId && selectedNucleusId && (receiptTemplate === "coordenador_secretario" || receiptTemplate === "tesouraria" || Number(receiptValueInput.replace(",", ".")) > 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          const teacher = teachers.find(t => t.id === selectedTeacherId)!;
                          const nucleus = nuclei.find(n => n.id === selectedNucleusId)!;
                          const isCoordenador = receiptTemplate === "coordenador_secretario";
                          const valorNum = (!receiptValueInput) ? 0 : Number(receiptValueInput.replace(",", "."));
                          const valorExtensoStr = (isCoordenador || !receiptValueInput) ? "" : receiptValueExtenso;
                          const tempRecibo: Recibo = {
                            id: "draft",
                            idProfessor: teacher.id,
                            nomeProfessor: teacher.nome,
                            cpfProfessor: teacher.cpf,
                            enderecoProfessor: `${teacher.endereco}, Bairro ${teacher.bairro}, ${teacher.cidadeUf}`,
                            idNucleo: nucleus.id,
                            nomeNucleo: nucleus.nome,
                            cursoNucleo: nucleus.curso,
                            data: receiptDate,
                            valor: valorNum,
                            valorExtenso: valorExtensoStr,
                            referente: receiptReferente,
                            duasVias: printLayoutConfig === "2_vias",
                            dataCriacao: new Date().toISOString(),
                            template: receiptTemplate,
                            disciplina: receiptDisciplina.trim() || undefined
                          };
                          setPreviewReceipt(tempRecibo);
                          setIsPreviewModalOpen(true);
                        }}
                        className="px-4 py-2.5 text-xs bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold rounded-lg border border-slate-200 transition cursor-pointer"
                      >
                        Visualizar Antes
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      disabled={teachers.length === 0 || nuclei.length === 0}
                      className="w-full sm:w-max bg-admin-navy hover:bg-admin-navy-medium text-white hover:text-admin-gold font-bold py-2.5 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs transition border border-admin-navy"
                    >
                      <Printer className="w-4 h-4 text-admin-gold" />
                      <span>Gerar e Abrir Impressora</span>
                    </button>
                  </div>

                </form>
              </div>

              {/* Informative print help column */}
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-xl border border-slate-200 space-y-4 lg:col-span-2 text-xs leading-relaxed text-slate-700">
                <h3 className="font-extrabold text-blue-950 flex items-center space-x-1.5 pb-2 border-b border-indigo-100">
                  <Info className="w-4 h-4 text-indigo-500" />
                  <span>Instruções da Impressora</span>
                </h3>
                
                <p>
                  O modelo visual de recibo do <strong>SIGTEO</strong> está configurado com regras de CSS no formato padrão de uma folha de papel <strong>A4</strong>.
                </p>

                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>
                    <strong>Duas Vias por Folha</strong>: Permite a impressão de duas réplicas idênticas do recibo (uma via para a tesouraria escolar e uma via para o professor), separadas por uma linha pontilhada discreta de folha.
                  </li>
                  <li>
                    <strong>Margens de Impressão</strong>: Na caixa de diálogo de impressão do seu navegador, é recomendado marcar as opções de <strong className="text-amber-700">Ocultar Cabeçalho e Rodapé</strong> e definir margens como <em>"Nenhuma"</em> ou <em>"Padrão"</em> para garantir o alinhamento perfeito.
                  </li>
                  <li>
                    <strong>Logo da Escola</strong>: O logo impresso será o definido nas Configurações do Sistema.
                  </li>
                </ul>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-250 text-amber-900 space-y-1 mt-4">
                  <span className="font-bold flex items-center"><Check className="w-3.5 h-3.5 mr-1" /> Dica de Exportação</span>
                  Se desejar guardar os recibos digitalmente, configure a sua impressora padrão como <strong>"Salvar como PDF"</strong> na caixa do navegador.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 6. HISTORY OF RECEIPTS SECTION */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Page Header */}
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold font-sans text-admin-navy">Histórico de Recibos Gerados</h2>
              <p className="text-xs text-slate-500">Consulte, reimprima ou remova recibos de pagamento emitidos anteriormente</p>
            </div>

            {/* Filter Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome do professor, núcleo vinculado ou ano-mês (ex: 2026-06)..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-admin-gold bg-slate-50 focus:bg-white transition"
                />
              </div>
              {historySearch && (
                <button 
                  onClick={() => setHistorySearch("")}
                  className="text-xs text-slate-500 hover:text-admin-navy font-bold cursor-pointer"
                >
                  Limpar Pesquisa
                </button>
              )}
            </div>

            {/* Batch actions panel */}
            {selectedReceiptIds.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-amber-100 p-2 rounded-lg text-amber-800">
                    <Printer className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Impressão de Recibos em Lote</h4>
                    <p className="text-[11px] text-slate-600">Você selecionou <strong>{selectedReceiptIds.length}</strong> {selectedReceiptIds.length === 1 ? 'recibo' : 'recibos'}. Eles serão diagramados de **2 por folha A4** (vias distintas ou em lote).</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedReceiptIds([])}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-amber-100 font-semibold rounded-lg transition duration-150 cursor-pointer"
                  >
                    Desmarcar Todos
                  </button>
                  <button
                    onClick={handlePrintSelectedReceipts}
                    className="px-4 py-2 bg-admin-navy hover:bg-admin-navy-medium text-white hover:text-admin-gold text-xs font-bold rounded-lg shadow flex items-center space-x-1.5 transition duration-150 cursor-pointer border border-admin-navy"
                  >
                    <Printer className="w-3.5 h-3.5 text-admin-gold" />
                    <span>Imprimir Selecionados (2 por folha A4)</span>
                  </button>
                </div>
              </div>
            )}

            {/* History Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {filteredReceipts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <History className="w-10 h-10 mx-auto stroke-1 text-slate-300 mb-2" />
                  Nenhum recibo correspondente foi encontrado no histórico.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-admin-navy text-white font-bold uppercase tracking-wider text-[10px] border-b border-admin-navy font-sans">
                        <th className="py-4 px-4 w-12 text-center text-slate-100">
                          <input 
                            type="checkbox"
                            checked={filteredReceipts.length > 0 && filteredReceipts.every(r => selectedReceiptIds.includes(r.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const newIds = Array.from(new Set([...selectedReceiptIds, ...filteredReceipts.map(r => r.id)]));
                                setSelectedReceiptIds(newIds);
                              } else {
                                const newIds = selectedReceiptIds.filter(id => !filteredReceipts.some(r => r.id === id));
                                setSelectedReceiptIds(newIds);
                              }
                            }}
                            className="rounded text-admin-gold focus:ring-0 cursor-pointer h-4 w-4 border-slate-300"
                          />
                        </th>
                        <th className="py-4 px-4 text-slate-100">Data do Recibo</th>
                        <th className="py-4 px-4 text-slate-100">Professor Favorecido</th>
                        <th className="py-4 px-4 text-slate-100 font-bold">Núcleo Escolar</th>
                        <th className="py-4 px-4 text-slate-100 font-bold">Valor Pago</th>
                        <th className="py-4 px-4 text-slate-100">Referência do Pagamento</th>
                        <th className="py-4 px-4 text-right text-slate-100">Ações de Documento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredReceipts.map(receipt => (
                        <tr key={receipt.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 w-12 text-center">
                            <input 
                              type="checkbox"
                              checked={selectedReceiptIds.includes(receipt.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedReceiptIds([...selectedReceiptIds, receipt.id]);
                                } else {
                                  setSelectedReceiptIds(selectedReceiptIds.filter(id => id !== receipt.id));
                                }
                              }}
                              className="rounded text-admin-gold focus:ring-0 cursor-pointer h-4 w-4 border-slate-300"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-705 font-medium select-none">
                            {new Date(receipt.data + "T12:00:00").toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800 block">{receipt.nomeProfessor}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{receipt.cpfProfessor}</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            <div>{receipt.nomeNucleo}</div>
                            <div className="text-[10px] font-normal text-slate-400">{receipt.cursoNucleo}</div>
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-emerald-650">{formatCurrency(receipt.valor)}</td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs">{receipt.referente}</td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handlePreviewReceipt(receipt)}
                              className="bg-slate-50 hover:bg-slate-200 border border-slate-200 text-slate-800 text-[11px] font-bold py-1.5 px-3 rounded inline-flex items-center"
                              title="Visualizar Recibo"
                            >
                              Visualizar
                            </button>
                            <button
                              onClick={() => handlePrintExistingReceipt(receipt)}
                              className="bg-blue-50 hover:bg-blue-100 border border-blue-150 text-blue-900 text-[11px] font-bold py-1.5 px-3 rounded inline-flex items-center"
                              title="Reimprimir Recibo"
                            >
                              <Printer className="w-3 h-3 mr-1 text-amber-500" />
                              <span>Imprimir</span>
                            </button>
                            <button
                              onClick={() => handleDeleteReceipt(receipt.id)}
                              className="text-slate-400 hover:text-white border border-transparent hover:bg-rose-600 hover:border-rose-700 p-1.5 rounded inline"
                              title="Excluir recibo do histórico"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline text-current" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* FOOTER BAR FOR SCREEN ENVIRONMENT */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 select-none print:hidden">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <img src={schoolSettings.logoUrl || defaultSchoolLogo} className="w-6 h-6 object-contain rounded-full" alt="" referrerPolicy="no-referrer" />
            <span className="font-semibold text-slate-200">SIGTEO Recibos - ESTEADEB</span>
          </div>
          <div className="text-center md:text-right">
            <p>&copy; 2026 - Escola Teológica das Assembleias de Deus no Brasil. Todos os direitos reservados.</p>
            <p className="text-[10px] text-slate-500 mt-1">Desenvolvido para Secretaria e Gestão Teológica Regional offline-first.</p>
          </div>
        </div>
      </footer>

      {/* INTERACTIVE POPUP / DIALOG PREVIEW DIALOG */}
      {isPreviewModalOpen && previewReceipt && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50 overflow-y-auto print:hidden">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl relative border border-slate-350 p-6 flex flex-col">
            
            {/* Header control */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Pré-visualização do Documento Impresso</h4>
                <p className="text-xs text-slate-500 mt-0.5">Confirma os dados conforme layout abaixo. Este é o exato modelo de folha A4.</p>
              </div>
              <button 
                onClick={() => { setIsPreviewModalOpen(false); setPreviewReceipt(null); }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Simulated exact A4 page content */}
            <div className="bg-slate-100 flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center max-h-[60vh] mt-4 rounded-xl border border-slate-200">
              <div className="bg-white w-full max-w-[210mm] shadow-lg border border-slate-300 p-6 font-serif text-slate-900 text-xs tracking-wide">
                
                {/* Internal container to loop 1 or 2 rows based on layout config */}
                {Array.from({ length: previewReceipt.duasVias ? 2 : 1 }).map((_, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <div className="my-6 border-t border-dashed border-slate-400 pt-6 flex items-center justify-center relative">
                        <span className="absolute -top-3 bg-white text-slate-400 px-3 py-0.5 rounded border border-slate-200 font-sans tracking-widest text-[9px] uppercase font-semibold">
                          Dobrar / Cortar Aqui (Recibo de Secretaria &amp; Via Docente)
                        </span>
                      </div>
                    )}

                    <div className="p-5 border-2 border-slate-900 rounded-lg relative bg-white text-slate-950">
                      {renderPrintReceiptContent(previewReceipt)}
                    </div>
                  </React.Fragment>
                ))}

              </div>
            </div>

            {/* Actions for Dialog */}
            <div className="mt-5 flex justify-end space-x-2 pt-4 border-t border-slate-200">
              <button 
                onClick={() => { setIsPreviewModalOpen(false); setPreviewReceipt(null); }}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold"
              >
                Voltar Ajustar
              </button>

              <button 
                onClick={() => {
                  handlePrintExistingReceipt(previewReceipt);
                  setIsPreviewModalOpen(false);
                }}
                className="px-5 py-2 bg-blue-900 border border-blue-950 text-white rounded-lg hover:bg-blue-950 text-xs font-bold flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir Recibo</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RENDER-ONLY DETACHED PRINT LAYOUT (Screen: Hidden / Prints: Blocks and Takes Over standard layouts) */}
      {printData && (
        <div 
          ref={printSectionRef} 
          id="esteadeb-printable-view" 
          className="hidden print:block absolute inset-0 bg-white text-black p-0 m-0 font-serif"
          style={{ width: "210mm", height: "stretch" }}
        >
          {printData.recibosList && printData.recibosList.length > 0 ? (
            /* Multi-receipt select list A4 rendering (2 distinct receipts fit neat per A4 sheet) */
            printData.recibosList.map((rcb, idx) => {
              const needsPageBreakAfter = idx % 2 === 1 && idx < printData.recibosList!.length - 1;
              return (
                <React.Fragment key={rcb.id + "-" + idx}>
                  {idx % 2 === 1 && (
                    <div className="text-center my-3 border-t-2 border-dashed border-gray-350 pt-3 relative">
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white text-gray-500 px-3 py-0.5 text-[8px] uppercase tracking-widest font-sans font-bold">
                        Dobra / Corte da Folha (Recibo Anterior &amp; Recibo Posterior)
                      </span>
                    </div>
                  )}

                  <div className="p-4 border-2 border-black rounded-xl relative bg-white tracking-wide" style={{ pageBreakInside: "avoid" }}>
                    {renderPrintReceiptContent(rcb)}
                  </div>

                  {needsPageBreakAfter && (
                    <div className="print-page-break" style={{ pageBreakBefore: "always", height: "0px" }}></div>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            /* Traditional Vias loop (Single Receipt duplicated/single via) */
            Array.from({ length: printData.vias === "2_vias" ? 2 : 1 }).map((_, idx) => {
              const rcb = printData.recibo!;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <div className="text-center my-3 border-t-2 border-dashed border-gray-350 pt-3 relative">
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white text-gray-500 px-3 py-0.5 text-[8px] uppercase tracking-widest font-sans font-bold">
                        Dobrar / Cortar Aqui (Recibo de Secretaria &amp; Via Docente)
                      </span>
                    </div>
                  )}

                  <div className="p-4 border-2 border-black rounded-xl relative bg-white tracking-wide" style={{ pageBreakInside: "avoid" }}>
                    {renderPrintReceiptContent(rcb)}
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      )}

      {/* GLOBAL CUSTOM CONFIRM MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in pointer-events-auto print:hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 overflow-hidden relative animate-scale-in">
            <div className="flex items-start space-x-3.5">
              <div className={`p-3 rounded-xl flex-shrink-0 ${
                confirmModal.variant === "danger" 
                  ? "bg-rose-50 text-rose-600" 
                  : confirmModal.variant === "warning"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-amber-50 text-admin-gold-dark"
              }`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="text-sm font-bold text-admin-navy font-sans leading-snug">
                  {confirmModal.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200 cursor-pointer transition duration-150 font-sans"
              >
                {confirmModal.cancelText || "Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) {
                    confirmModal.onConfirm();
                  }
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white cursor-pointer transition duration-150 shadow-sm font-sans ${
                  confirmModal.variant === "danger"
                    ? "bg-rose-600 hover:bg-rose-700 font-bold"
                    : confirmModal.variant === "warning"
                    ? "bg-admin-navy hover:bg-admin-navy-medium text-white font-bold"
                    : "bg-admin-gold hover:bg-admin-gold-dark text-admin-navy font-black"
                }`}
              >
                {confirmModal.confirmText || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
