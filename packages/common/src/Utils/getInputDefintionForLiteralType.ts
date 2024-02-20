import {
  InputType,
  InputTypeDefinition,
  LiteralType,
  simpleTypeToInputType,
} from '../flyteidl/coreTypes';

/** Converts a `LiteralType` to an `InputTypeDefintion` to assist with rendering
 * a type annotation and converting input values.
 */
export function getInputDefintionForLiteralType(literalType: LiteralType): InputTypeDefinition {
  const result: InputTypeDefinition = {
    type: InputType.Unknown,
  };

  switch (true) {
    case 'blob' in literalType:
      result.type = InputType.Blob;
      break;
    case 'enum' in literalType:
      result.type = InputType.Enum;
      break;
    case 'collectionType' in literalType:
      result.type = InputType.Collection;
      result.subtype = getInputDefintionForLiteralType(literalType.collectionType!);
      break;
    case 'mapValueType' in literalType:
      result.type = InputType.Map;
      result.subtype = getInputDefintionForLiteralType(literalType.mapValueType!);
      break;
    case 'simple' in literalType:
      result.type = simpleTypeToInputType[literalType.simple!];
      break;
    case 'schema' in literalType:
      result.type = InputType.Schema;
      break;
    case 'unionType' in literalType:
      result.type = InputType.Union;
      result.listOfSubTypes = literalType.unionType!.variants?.map((variant) =>
        getInputDefintionForLiteralType(variant as LiteralType),
      );
      break;
    default:
      result.type = InputType.Unknown;
  }

  return result;
}
