import { readFileSync } from 'fs';

const struct = require('python-struct');

const { readBufferFromBigInt } = require('../../Helpers');

import { GramJsApi } from './types';

function buildApiFromTlSchema() {
  const tlContent = readFileSync('./schema.tl', 'utf-8');
  const constructorParams = extractConstructorParams(tlContent) as any;
  const functionParams = extractFunctionParams(tlContent) as any;
  
  return {
    constructors: createClasses('constructor', constructorParams),
    requests: createClasses('request', functionParams),
  };
}

function extractConstructorParams(fileContent: string) {
  // Parses the file content and builds an object with IDs, names, args, and other stuff.
  // Much like /gramjs_generator/parsers/tlobject/parser.js
}

function extractFunctionParams(fileContent: string) {
  // Parses the file contents and builds an object with IDs, names, args, and other stuff.
  // Much like /gramjs_generator/parsers/methods.js (? Not sure about "friendly format")
}

class BaseClass {
  static serializeBytes() {
    // Code goes here as it is now.
  }
  
  static serializeDate() {
    // Code goes here as it is now.
  }
}

function createClasses(classesType: 'constructor' | 'request', params: any[]) {
  const classes: Record<string, Function> = {};
  
  for (const classParams of params) {
    const { name, constructorId, subclassOfId, argsConfig } = classParams;
    
    class VirtualClass extends BaseClass {
      [arg: string]: any;
      
      CONSTRUCTOR_ID = constructorId;
      SUBCLASS_OF_ID = subclassOfId;
      
      constructor(args: Record<string, any>) {
        super();
        
        Object.keys(args).forEach((argName: string) => {
          this[argName] = args[argName];
        });
      }
      
      static fromReader(reader: any) {
        const args: any = {};
        
        // The next is pseudo-code:
        argsConfig.forEach(([argName, argType]: [string, string]) => {
          switch (argType) {
            case 'int':
              args[argName] = reader.readInt();
              break;
            case 'long':
              args[argName] = reader.readLong();
              break;
            // case '...':
            //     args[argName] = '...';
            //     break;
          }
        });
        
        return new VirtualClass(args);
      }
      
      getBytes(reader: any) {
        // The next is pseudo-code:
        const idForBytes = '...'; // Get it somehow from `subclassOfId`.
        
        return Buffer.concat([
          Buffer.from(idForBytes, 'hex'),
          ...argsConfig.map(([argName, argType]: [string, string]) => {
            switch (argType) {
              case 'int':
                return struct.pack('<i', this[argName]);
              case 'long':
                return readBufferFromBigInt(this[argName], 8, true, true);
              // case '...':
              //     return '...';
            }
          }),
        ]);
      }
      
      readResult(reader: any) {
        if (classesType !== 'request') {
          throw new Error('`readResult()` called for non-request instance');
        }
        
        return reader.tgReadObject();
      }
      
      async resolve(client: any, utils: any) {
        if (classesType !== 'request') {
          throw new Error('`resolve()` called for non-request instance');
        }
        
        // The next is pseudo-code:
        argsConfig.forEach(async ([argName, argType]: [string, string]) => {
          switch (argType) {
            case 'whatever should be resolved':
              const method = `get${'something here'}`;
              const entity = await client.getInputEntity(this[argName]);
              this[argName] = utils[method](entity);
              break;
            // case '...':
            //     this[argName] = '...';
            //     break;
          }
        });
      }
    }
    
    classes[name] = VirtualClass;
  }
  
  return classes;
}

// Here we are forcing the "magic" function to "return" pre-defined types with `as` keywords.
export const gramJsApi = buildApiFromTlSchema() as unknown as GramJsApi;
