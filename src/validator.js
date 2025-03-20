export const validate = (params) => {
  const keys = [ "box_id", "box_data", "box_valor", "box_de", "box_para", "box_pix", "box_text" ]  
  const valid = keys.filter( key => Reflect.has(params, key) === false || params[key] === null )

  return valid.length === 0 ? false : true
} 

