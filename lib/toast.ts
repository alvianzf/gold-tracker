import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#ffffff',
  color: '#1e293b',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  customClass: {
    popup: 'border-pencil-strong shadow-doodle font-semibold'
  }
});

export const showSuccessToast = (message: string) => {
  Toast.fire({
    icon: 'success',
    title: message
  });
};

export const showErrorToast = (message: string) => {
  Toast.fire({
    icon: 'error',
    title: message
  });
};
