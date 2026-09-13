import Swal, { SweetAlertIcon } from 'sweetalert2';

// Instancia base personalizada con la paleta de Conecta 360
const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl shadow-2xl border border-slate-200 font-sans p-6',
    title: 'text-lg font-black text-slate-900',
    htmlContainer: 'text-sm text-slate-600',
    confirmButton: 'px-5 py-2.5 rounded-xl bg-[#0056d2] hover:bg-[#0046a8] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer mx-1',
    cancelButton: 'px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer mx-1',
  },
  buttonsStyling: false,
});

/**
 * Muestra una alerta de éxito
 */
export async function showSuccess(title: string, text?: string) {
  return customSwal.fire({
    icon: 'success',
    title,
    text,
    timer: 2800,
    timerProgressBar: true,
    confirmButtonText: 'Entendido',
  });
}

/**
 * Muestra una alerta de error
 */
export async function showError(title: string, text?: string) {
  return customSwal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Cerrar',
  });
}

/**
 * Muestra una advertencia
 */
export async function showWarning(title: string, text?: string) {
  return customSwal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'Aceptar',
  });
}

export interface ConfirmOptions {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: SweetAlertIcon;
}

/**
 * Muestra un diálogo de confirmación (reemplaza confirm() nativo del navegador)
 * Retorna true si el usuario confirma, false si cancela
 */
export async function showConfirm(
  titleOrOptions: string | ConfirmOptions,
  text?: string,
  confirmText?: string,
  cancelTextOrColor?: string
): Promise<boolean> {
  let title = '';
  let subText: string | undefined = undefined;
  let confText = 'Sí, confirmar';
  let cancText = 'Cancelar';
  let icon: SweetAlertIcon = 'question';

  if (typeof titleOrOptions === 'object') {
    title = titleOrOptions.title;
    subText = titleOrOptions.text;
    confText = titleOrOptions.confirmText || confText;
    cancText = titleOrOptions.cancelText || cancText;
    icon = titleOrOptions.icon || icon;
  } else {
    title = titleOrOptions;
    subText = text;
    if (confirmText) confText = confirmText;
    if (cancelTextOrColor && !cancelTextOrColor.startsWith('#')) {
      cancText = cancelTextOrColor;
    }
  }

  const result = await customSwal.fire({
    title,
    text: subText,
    icon,
    showCancelButton: true,
    confirmButtonText: confText,
    cancelButtonText: cancText,
    reverseButtons: true,
  });
  return result.isConfirmed;
}

/**
 * Toast flotante no intrusivo en la esquina superior derecha
 */
export function showSwalToast(title: string, icon: SweetAlertIcon = 'success') {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    customClass: {
      popup: 'rounded-2xl shadow-xl border border-slate-200 text-xs font-bold p-3',
      title: 'text-xs font-bold text-slate-800',
    },
  });

  return Toast.fire({
    icon,
    title,
  });
}

export default customSwal;
