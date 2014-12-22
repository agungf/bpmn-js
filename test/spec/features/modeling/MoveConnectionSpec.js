'use strict';

/* global bootstrapModeler, inject */

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

var Fixtures = require('../../../fixtures');

var _ = require('lodash');

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - move connection', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = Fixtures.getDiagram('sequence-flows.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('connection handling', function() {

    it('should execute', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlow = sequenceFlowConnection.businessObject;

      // when
      modeling.moveConnection(sequenceFlowConnection, { x: 20, y: 10 });

      // then

      // expect cropped connection
      expect(sequenceFlowConnection.waypoints).toDeepEqual([
        { x: 598, y: 351 },
        { x: 954, y: 351 },
        { x: 954, y: 446 },
        { x: 852, y: 446 }
      ]);

      // expect cropped waypoints in di
      expect(sequenceFlow.di.waypoint).toDeepEqual([
        { $type: 'dc:Point', x: 598, y: 351 },
        { $type: 'dc:Point', x: 954, y: 351 },
        { $type: 'dc:Point', x: 954, y: 446 },
        { $type: 'dc:Point', x: 852, y: 446 }
      ]);
    }));

  });


  describe('undo support', function() {

    it('should undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlow = sequenceFlowConnection.businessObject;

      var oldWaypoints = sequenceFlowConnection.waypoints,
          oldDiWaypoints = sequenceFlow.di.waypoint;

      modeling.moveConnection(sequenceFlowConnection, { x: 20, y: 10 });

      // when
      commandStack.undo();

      // then
      expect(sequenceFlowConnection.waypoints).toDeepEqual(oldWaypoints);
      expect(sequenceFlow.di.waypoint).toDeepEqual(oldDiWaypoints);
    }));

  });


  describe('redo support', function() {

    it('should redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlow = sequenceFlowConnection.businessObject;

      modeling.moveConnection(sequenceFlowConnection, { x: 20, y: 10 });

      var newWaypoints = sequenceFlowConnection.waypoints,
          newDiWaypoints = sequenceFlow.di.waypoint;

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(sequenceFlowConnection.waypoints).toDeepEqual(newWaypoints);
      expect(sequenceFlow.di.waypoint).toDeepEqual(newDiWaypoints);
    }));

  });

});
