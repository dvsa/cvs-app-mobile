import { TestTypesReferenceDataModel } from '../../../models/reference-data-models/test-types.model';

export class TestTypesReferenceDataMock {
  public static get TestTypesData(): TestTypesReferenceDataModel[] {
    return [
      {
        id: '1',
        sortId: '1',
        name: 'annual test',
        testTypeName: 'Annual test',
        forVehicleType: ['psv'],
        forVehicleSize: ['small', 'large'],
        forVehicleConfiguration: ['articulated', 'rigid'],
        forVehicleAxles: null,
        forEuVehicleCategory: null,
        forVehicleClass: null,
        forVehicleSubclass: null,
        forVehicleWheels: null,
        testTypeClassification: 'Annual With Certificate',
        linkedIds: ['38', '39']
      },
      {
        id: '2',
        sortId: '2',
        name: 'class 6a (seatbelt installation check)',
        forVehicleType: ['psv'],
        forVehicleSize: ['small', 'large'],
        forVehicleConfiguration: ['rigid'],
        forVehicleAxles: null,
        forEuVehicleCategory: null,
        forVehicleClass: null,
        forVehicleSubclass: null,
        forVehicleWheels: null,
        nextTestTypesOrCategories: [
          {
            id: '3',
            sortId: '3',
            name: 'annual',
            testTypeName: 'Class 6A seatbelt installation check (annual test)',
            forVehicleType: ['psv'],
            forVehicleSize: ['small', 'large'],
            forVehicleConfiguration: ['rigid'],
            forVehicleAxles: null,
            forEuVehicleCategory: null,
            forVehicleClass: null,
            forVehicleSubclass: null,
            forVehicleWheels: null,
            testTypeClassification: 'Annual With Certificate',
            linkedIds: ['38', '39']
          },
          {
            id: '4',
            sortId: '4',
            name: 'first test',
            testTypeName: 'Class 6A seatbelt installation check (first test)',
            forVehicleType: ['psv'],
            forVehicleSize: ['large'],
            forVehicleConfiguration: ['rigid'],
            forVehicleAxles: null,
            forEuVehicleCategory: null,
            forVehicleClass: null,
            forVehicleSubclass: null,
            forVehicleWheels: null,
            testTypeClassification: 'Annual With Certificate',
            linkedIds: ['38', '39']
          }
        ]
      },
      {
        id: '5',
        sortId: '5',
        name: 'retest',
        forVehicleType: ['psv'],
        forVehicleSize: ['large', 'small'],
        forVehicleConfiguration: ['rigid', 'articulated'],
        forVehicleAxles: null,
        forEuVehicleCategory: null,
        forVehicleClass: null,
        forVehicleSubclass: null,
        forVehicleWheels: null,
        nextTestTypesOrCategories: [
          {
            id: '6',
            sortId: '6',
            name: 'paid',
            forVehicleType: ['psv'],
            forVehicleSize: ['large', 'small'],
            forVehicleConfiguration: ['rigid', 'articulated'],
            forVehicleAxles: null,
            forEuVehicleCategory: null,
            forVehicleClass: null,
            forVehicleSubclass: null,
            forVehicleWheels: null,
            nextTestTypesOrCategories: [
              {
                id: '7',
                sortId: '7',
                name: 'any psv',
                testTypeName: 'Paid retest',
                forVehicleType: ['psv'],
                forVehicleSize: ['large', 'small'],
                forVehicleConfiguration: ['rigid', 'articulated'],
                forVehicleAxles: null,
                forEuVehicleCategory: null,
                forVehicleClass: null,
                forVehicleSubclass: null,
                forVehicleWheels: null,
                testTypeClassification: 'Annual With Certificate',
                linkedIds: ['38', '39']
              },
              {
                id: '8',
                sortId: '8',
                name: 'class 6a (seatbelt installation check)',
                testTypeName: 'Paid retest with Class 6A seatbelt installation check',
                forVehicleType: ['psv'],
                forVehicleSize: ['small', 'large'],
                forVehicleConfiguration: ['rigid'],
                forVehicleAxles: null,
                forEuVehicleCategory: null,
                forVehicleClass: null,
                forVehicleSubclass: null,
                forVehicleWheels: null,
                testTypeClassification: 'Annual With Certificate',
                linkedIds: ['38', '39']
              }
            ]
          },
          {
            id: '9',
            sortId: '9',
            name: 'part paid',
            forVehicleType: ['psv'],
            forVehicleSize: ['large', 'small'],
            forVehicleConfiguration: ['rigid', 'articulated'],
            forVehicleAxles: null,
            forEuVehicleCategory: null,
            forVehicleClass: null,
            forVehicleSubclass: null,
            forVehicleWheels: null,
            nextTestTypesOrCategories: [
              {
                id: '10',
                sortId: '10',
                name: 'triple test',
                testTypeName: 'Triple test',
                forVehicleType: ['psv'],
                forVehicleSize: ['large', 'small'],
                forVehicleConfiguration: ['rigid', 'articulated'],
                forVehicleAxles: [2],
                forEuVehicleCategory: null,
                forVehicleClass: null,
                forVehicleSubclass: null,
                forVehicleWheels: null,
                linkedIds: ['38', '39']
              }
            ]
          }
        ]
      },
      {
        id: '11',
        sortId: '11',
        name: 'full test',
        testTypeName: 'Full test',
        forVehicleType: ['psv', 'trailer'],
        forVehicleSize: ['large'],
        forVehicleConfiguration: ['articulated'],
        forVehicleAxles: [2],
        forEuVehicleCategory: null,
        forVehicleClass: null,
        forVehicleSubclass: null,
        forVehicleWheels: null,
        linkedIds: null,
        nextTestTypesOrCategories: null
      }
    ];
  }
}
