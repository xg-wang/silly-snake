const opposite = (dir) => {
  switch (dir) {
    case 'up':
      return 'down'
    case 'down':
      return 'up'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
    default:
      console.error('dir input not supported!', dir)
      return 'down'
  }
}

export { opposite }
