import { createVNode, render } from 'vue'
import { Position, ToastObject, ToastOptions, ToastContent } from '../types';
import Toast from './MToast.vue'

const toasts: Record<Position, ToastObject[]> = {
  'top-left': [],
  'top-right': [],
  'bottom-left': [],
  'bottom-right': [],
  'top-center': [],
  'bottom-center': [],
}

const defaultOptions: ToastOptions = { type: 'default', timeout: 5000, closable: true, position: 'top-right', transition: 'bounce', hideProgressBar: false }

let toastId = 0;

const initializeOptions = (options: ToastOptions): ToastOptions => {
  const processedOptions: ToastOptions = {
    type: options.type || defaultOptions.type,
    timeout: options.timeout || defaultOptions.timeout,
    closable: options.closable,
    position: options.position || defaultOptions.position,
    showIcon: options.showIcon,
    transition: options.transition || defaultOptions.transition,
    onClose: options.onClose
  }

  processedOptions.hideProgressBar = processedOptions.timeout !== undefined && processedOptions.timeout <= 0
  if (options.hideProgressBar !== undefined) {
    processedOptions.hideProgressBar = options.hideProgressBar
  }
  return processedOptions
}

export const createToast = (content: ToastContent, options?: ToastOptions) => {
  
  const initializedOptions = options ? initializeOptions(options) : defaultOptions;
  const text = typeof content === 'string' ? content : content.title;
  const description = typeof content === 'string' ? undefined : content.description;

  let verticalOffset = 12
  const id = toastId++;

  if (!initializedOptions.position) return;
  toasts[initializedOptions.position].forEach(({ toastVNode }) => {
    const offsetHeight = (toastVNode.el as HTMLElement).offsetHeight + 12
    verticalOffset += (offsetHeight || 0)
  })

  const container = document.createElement('div')
  document.body.appendChild(container);

  let toastVNode = null;
  toastVNode = createVNode(Toast, {
    ...initializedOptions,
    text,
    description,
    id,
    offset: verticalOffset,
    visible: false,
    onCloseHandler: () => { close(id, initializedOptions.position ? initializedOptions.position : 'top-right') }
  })

  render(toastVNode, container)
  if (!initializedOptions.position) return;

  toasts[initializedOptions.position].push({ toastVNode, container });

  if (toastVNode.component) {
    toastVNode.component.props.visible = true
  }
}

const close = (id: number, position: Position) => {
  const toastArr = toasts[position];

  const index = toastArr.findIndex(({ toastVNode }) => id === toastVNode.props.id)

  if (index === -1) return;
  const { container, toastVNode } = toastArr[index] as ToastObject;

  const height = toastVNode.el.offsetHeight;

  toasts[position].splice(index, 1)
  toastVNode.component.props.visible = false;

  if (toastVNode.component.props.onClose) {
    toastVNode.component.props.onClose()
  }

  for (let i = index; i < toastArr.length; i++) {
    const { toastVNode } = toastArr[i] as ToastObject;

    if (!toastVNode.el) return;

    const verticalPos: string = position.split('-')[0] || 'top'
    const pos = parseInt(toastVNode.el.style[verticalPos], 10) - height - 12;

    if (!toastVNode.component) return;
    toastVNode.component.props.offset = pos
  }

  setTimeout(() => {
    render(null, container)
    document.body.removeChild(container)
  }, 1000)
}
